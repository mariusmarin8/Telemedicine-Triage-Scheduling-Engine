use axum::{extract::State, http::StatusCode, Extension, Json};
use serde::Serialize;
use serde_json::{json, Value};
use sqlx::PgPool;
use uuid::Uuid;
use chrono::{DateTime, Utc};

use crate::middleware::auth::TokenPayload;
use super::db as doctor_db;
use super::dto::{DoctorProfileDTO, DoctorAppointmentDTO, FinalizeConsultationInput};

/// GET /api/doctors/profile
pub async fn get_doctor_profile(
    State(pool): State<PgPool>,
    Extension(user): Extension<TokenPayload>,
) -> Result<Json<DoctorProfileDTO>, (StatusCode, Json<Value>)> {
    
    let profile = doctor_db::get_doctor_profile_db(&pool, user.user_id)
        .await
        .map_err(|e| match e {
            sqlx::Error::RowNotFound => (
                StatusCode::NOT_FOUND,
                Json(json!({ "message": "Contul de medic nu a fost găsit." })),
            ),
            _ => (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "message": "Eroare internă la obținerea profilului." })),
            ),
        })?;

    Ok(Json(profile))
}

/// GET /api/doctors/appointments
pub async fn list_doctor_appointments(
    State(pool): State<PgPool>,
    Extension(user): Extension<TokenPayload>,
) -> Result<Json<Vec<DoctorAppointmentDTO>>, (StatusCode, Json<Value>)> {
    
    let appointments = doctor_db::get_doctor_appointments_db(&pool, user.user_id)
        .await
        .map_err(|e| (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "message": format!("Eroare la încărcarea cozii: {}", e) })),
        ))?;

    Ok(Json(appointments))
}

/// POST /api/doctor/finalize-consultation
pub async fn finalize_consultation(
    State(pool): State<PgPool>,
    Extension(_user): Extension<TokenPayload>,
    Json(payload): Json<FinalizeConsultationInput>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    
    let success = doctor_db::finalize_consultation_db(&pool, &payload)
        .await
        .map_err(|e| (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "message": format!("Eroare la scrierea în SGBD: {}", e) })),
        ))?;

    if success {
        Ok(Json(json!({ 
            "status": "success", 
            "message": "Consultația a fost semnată și salvată cu succes." 
        })))
    } else {
        Err((
            StatusCode::BAD_REQUEST,
            Json(json!({ "message": "Nu s-a putut finaliza. Programarea este invalidă." })),
        ))
    }
}

#[derive(Serialize, sqlx::FromRow)]
pub struct DoctorHistoryRecord {
    pub id: Uuid,
    pub patient_name: String,
    pub diagnosis: Option<String>,
    pub consultation_date: DateTime<Utc>, // <-- Numele corectat aici
}

//GET /api/doctor/history
pub async fn get_doctor_history_handler(
    State(pool): State<PgPool>,
    Extension(user): Extension<TokenPayload>,
) -> Result<Json<Vec<DoctorHistoryRecord>>, (StatusCode, Json<Value>)> {
    
    let records = sqlx::query_as!(
        DoctorHistoryRecord,
        r#"
        SELECT 
            c.id,
            (p.first_name || ' ' || p.last_name) AS "patient_name!",
            c.final_diagnosis AS diagnosis,
            c.consultation_date AS "consultation_date!" 
            
        FROM consultations c
        JOIN patients p ON c.patient_id = p.id
        WHERE c.doctor_id = $1 
          AND c.status = 'Finalizat??'
        ORDER BY c.consultation_date DESC
        "#,
        user.user_id
    )
    .fetch_all(&pool)
    .await
    .map_err(|e| {
        eprintln!("Eroare DB la istoricul doctorului: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "message": "Nu am putut încărca istoricul consultațiilor." }))
        )
    })?;

    Ok(Json(records))
}


#[derive(Serialize, sqlx::FromRow)]
pub struct DoctorPatientRecord {
    pub id: Uuid,
    pub patient_name: String,
    pub cnp: Option<String>,
    pub age: i32,
    pub gender: String,
}

/// GET /api/doctors/patients
pub async fn list_all_patients_handler(
    State(pool): State<PgPool>,
    Extension(_user): Extension<TokenPayload>, 
) -> Result<Json<Vec<DoctorPatientRecord>>, (StatusCode, Json<Value>)> {
    
    let patients = sqlx::query_as!(
        DoctorPatientRecord,
        r#"
        SELECT 
            id,
            (first_name || ' ' || last_name) AS "patient_name!",
            cnp,
            get_patient_age(date_of_birth) AS "age!", 
            gender::text AS "gender!"
        FROM patients
        WHERE parent_id IS NULL 
        ORDER BY last_name ASC, first_name ASC
        "#,
    )
    .fetch_all(&pool)
    .await
    .map_err(|e| {
        eprintln!("Eroare DB la listarea pacienților: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "message": "Nu am putut încărca lista de pacienți." }))
        )
    })?;

    Ok(Json(patients))
}