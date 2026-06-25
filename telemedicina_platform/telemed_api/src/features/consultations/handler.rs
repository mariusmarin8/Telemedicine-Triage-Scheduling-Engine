use axum::{extract::State, http::StatusCode, Extension, Json};
use serde_json::{json, Value};
use sqlx::PgPool;


use crate::middleware::auth::TokenPayload; 
use super::db as patient_db;
use super::dto::PatientMedicalRecordDTO;

/// GET /api/consultations
pub async fn get_patient_medical_records(
    State(pool): State<PgPool>,
    Extension(user): Extension<TokenPayload>,
) -> Result<Json<Vec<PatientMedicalRecordDTO>>, (StatusCode, Json<Value>)> {
    
    
    let records = patient_db::get_full_patient_medical_records_db(&pool, user.user_id)
        .await
        .map_err(|e| (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "message": format!("Eroare SGBD la extragerea fișelor medicale: {}", e) })),
        ))?;

    Ok(Json(records))
}