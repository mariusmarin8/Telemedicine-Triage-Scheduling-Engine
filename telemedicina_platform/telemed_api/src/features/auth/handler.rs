use axum::{extract::State, Json, http::StatusCode};
use sqlx::{PgPool, Row};
use serde_json::{json, Value}; 
use crate::features::auth::dto::*;
use crate::features::auth::db as auth_db;
use crate::middleware::auth::generate_token;
pub async fn register_patient(
    State(pool): State<PgPool>,
    Json(payload): Json<RegisterRequest>,
) -> Result<Json<AuthResponse>, (StatusCode, Json<Value>)> {
    
   
    let row = auth_db::register_user_db(&pool, payload).await
        .map_err(|e| (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "message": format!("Eroare bază de date: {}", e) }))
        ))?;

    let success: bool = row.get("success");
    let message: String = row.get("message");
    let patient_id: Option<uuid::Uuid> = row.get("patient_id");

    if !success {
        return Err((StatusCode::BAD_REQUEST, Json(json!({ "message": message }))));
    }

    Ok(Json(AuthResponse {
        token: None,
        role: "Patient".into(),
        message,
        user_id: patient_id,
    }))
}

pub async fn login_patient(
    State(pool): State<PgPool>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<AuthResponse>, (StatusCode, Json<Value>)> {
    
    // Verificăm credențialele în baza de date
    let user_id = auth_db::authenticate_user_db(&pool, &payload.email, &payload.password).await
        .map_err(|e| (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "message": format!("Eroare Bază de Date: {}", e) }))
        ))?;

    match user_id {
        Some(id) => {
            // Generăm Token-ul JWT
            let token = generate_token(id, "Patient")
                .map_err(|_| (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(json!({ "message": "Eroare la generarea token-ului de securitate" }))
                ))?;
            
            Ok(Json(AuthResponse {
                token: Some(token),
                role: "Patient".into(),
                message: "Login reușit".into(),
                user_id: Some(id),
            }))
        }
        // Cazul în care email-ul sau parola sunt greșite
        None => Err((
            StatusCode::UNAUTHORIZED,
            Json(json!({ "message": "Email sau parolă incorectă" }))
        )),
    }
}

pub async fn register_doctor(
    State(pool): State<PgPool>,
    Json(payload): Json<RegisterDoctorRequest>,
) -> Result<Json<AuthResponse>, (StatusCode, Json<Value>)> {

    let row = auth_db::register_doctor_db(&pool, payload).await
        .map_err(|e| (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "message": format!("Eroare bază de date: {}", e) }))
        ))?;
    let success: bool = row.get("success");
    let message: String = row.get("message");
    let doctor_id: Option<uuid::Uuid> = row.get("doctor_id");

    if !success {
        return Err((StatusCode::BAD_REQUEST, Json(json!({ "message": message }))));
    }

    Ok(Json(AuthResponse {
        token: None, 
        role: "Doctor".into(),
        message,
        user_id: doctor_id,
    }))
}

pub async fn login_doctor(
    State(pool): State<PgPool>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<AuthResponse>, (StatusCode, Json<Value>)> {
    
   
    let doctor_id = auth_db::authenticate_doctor_db(&pool, &payload.email, &payload.password).await
        .map_err(|e| (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "message": format!("Eroare Bază de Date: {}", e) }))
        ))?;

    match doctor_id {
        Some(id) => {
            let token = generate_token(id, "Doctor")
                .map_err(|_| (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(json!({ "message": "Eroare la generarea token-ului de securitate" }))
                ))?;
            
            Ok(Json(AuthResponse {
                token: Some(token),
                role: "Doctor".into(),
                message: "Autentificare medic reușită".into(),
                user_id: Some(id),
            }))
        }
        None => Err((
            StatusCode::UNAUTHORIZED,
            Json(json!({ "message": "Email sau parolă incorectă." })) // Am scos textul cu "cont inactiv"
        )),
    }
}