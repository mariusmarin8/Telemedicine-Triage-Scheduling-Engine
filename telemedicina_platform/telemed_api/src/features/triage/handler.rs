use axum::{extract::{State, Path}, Json};
use sqlx::PgPool;
use axum::http::StatusCode;
use uuid::Uuid;
use serde_json::{json, Value};

use crate::features::triage::dto::{GenerateFormRequest, TriageFormResponse, EvaluateAnswersRequest, TriageDecisionResponse, SymptomDTO, MedicalRecordDTO};
use crate::features::triage::db;

pub async fn check_telemedicine_access(
    pool: &PgPool,
    target_patient_id: Uuid,
) -> Result<bool, sqlx::Error> {
    
    let has_access = sqlx::query_scalar!(
        r#"SELECT has_telemedicine_access($1) AS "has_access!""#,
        target_patient_id
    )
    .fetch_one(pool)
    .await?;

    Ok(has_access)
}

// POST /api/triage/patient/:id/generate

pub async fn generate_form(
    State(pool): State<PgPool>,
    Path(patient_id): Path<Uuid>, 
    Json(payload): Json<GenerateFormRequest>,
) -> Result<Json<TriageFormResponse>, (StatusCode, String)> {
    

    let has_access = check_telemedicine_access(&pool, patient_id)
        .await
        .unwrap_or(false); 

    if !has_access {
        return Err((
            StatusCode::PAYMENT_REQUIRED,
            "Acces restricționat. Aveți nevoie de un abonament activ (Individual sau Family).".to_string()
        ));
    }

   let result = db::generate_triage_form_db(&pool, patient_id, payload.symptom_ids)
        .await
        .map_err(|e| {
            eprintln!("Eroare DB la generarea form-ului: {}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Eroare internă la procesarea simptomelor.".into())
        })?;

    Ok(Json(result))
}

// POST /api/triage/patient/:id/evaluate

pub async fn evaluate_answers(
    State(pool): State<PgPool>,
    Path(patient_id): Path<Uuid>,
    Json(payload): Json<EvaluateAnswersRequest>,
) -> Result<Json<TriageDecisionResponse>, (StatusCode, String)> {
    let result = db::evaluate_triage_answer_db(&pool, patient_id, &payload.template_slug, payload.answers)
        .await
        .map_err(|e| {
            eprintln!("Eroare DB la evaluarea răspunsurilor: {}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Eroare internă la evaluarea răspunsurilor.".into())
        })?;

    Ok(Json(result))
}


//GET /api/triage/symptoms
pub async fn get_symptoms(
    State(pool): State<PgPool>,
) -> Result<Json<Vec<SymptomDTO>>, (StatusCode, String)> {
    match db::get_all_symptoms_db(&pool).await {
        Ok(symptoms) => Ok(Json(symptoms)),
        Err(err) => {
            eprintln!("Eroare la obținerea simptomelor: {:?}", err);
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                "Nu s-au putut încărca simptomele din baza de date.".to_string(),
            ))
        }
    }
}
// GET /api/triage/records/:id
pub async fn get_medical_record_handler(
    Path(record_id): Path<Uuid>,
    State(pool): State<PgPool>,
) -> Result<Json<MedicalRecordDTO>, (StatusCode, String)> {
    
    let record = db::get_record_db(&pool, record_id)
        .await
        .map_err(|e| {
            if matches!(e, sqlx::Error::RowNotFound) {
                (
                    StatusCode::NOT_FOUND,
                    "Fișa medicală nu a fost găsită.".to_string()
                )
            } else {
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    format!("Eroare server: {}", e)
                )
            }
        })?; 
    Ok(Json(record))
}