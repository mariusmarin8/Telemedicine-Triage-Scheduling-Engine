use axum::{extract::{State, Query}, http::StatusCode, Extension, Json};
use serde::Deserialize; 
use uuid::Uuid;        
use serde_json::{json, Value};
use sqlx::PgPool;
use super::db as patient_db;
use super::dto::PatientHistoryDTO;
use crate::middleware::auth::TokenPayload;

#[derive(Deserialize)]
pub struct HistoryParams {
    pub patient_id: Option<Uuid>,
}

/// GET /api/history/al-records
pub async fn get_patient_history(
    State(pool): State<PgPool>,
    Extension(user): Extension<TokenPayload>,
    Query(params): Query<HistoryParams>,
) -> Result<Json<Vec<PatientHistoryDTO>>, (StatusCode, Json<Value>)> {
    let target_id = params.patient_id.unwrap_or(user.user_id);

    let records = patient_db::get_patient_history_db(&pool, target_id)
        .await
        .map_err(|e| (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "message": format!("Eroare SGBD la generarea timeline-ului clinic: {}", e) })),
        ))?;

    Ok(Json(records))
}