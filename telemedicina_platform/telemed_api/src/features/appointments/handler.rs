use axum::{extract::State, http::StatusCode, Extension, Json};
use serde_json::{json, Value};
use sqlx::PgPool;
use crate::middleware::auth::TokenPayload;
use super::db as appointment_db; // Ne asigurăm că facem legătura către db.rs
use super::dto::PatientAppointmentHistoryDTO;

/// GET /api/appointments/history
pub async fn get_patient_appointments_history(
    State(pool): State<PgPool>,
    Extension(user): Extension<TokenPayload>,
) -> Result<Json<Vec<PatientAppointmentHistoryDTO>>, (StatusCode, Json<Value>)> {
    let appointments = appointment_db::get_patient_appointments_history_db(&pool, user.user_id)
        .await
        .map_err(|e| (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "message": format!("Eroare la scrierea în SGBD: {}", e) })),
        ))?;

    Ok(Json(appointments))
}