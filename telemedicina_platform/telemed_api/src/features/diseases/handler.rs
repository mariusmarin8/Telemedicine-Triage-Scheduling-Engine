use axum::{extract::{Path, State},http::StatusCode, Json, Extension,};
use sqlx::PgPool;
use uuid::Uuid;
use serde_json::{json, Value};

use crate::features::diseases::dto::{DiseaseCatalogDto, UpdateConditionsDto};
use crate::features::diseases::db as diseases_db;
use crate::middleware::auth::TokenPayload;

/// GET /api/diseases/catalog
pub async fn get_catalog(State(pool): State<PgPool>, Extension(_user): Extension<TokenPayload>,) -> Result<Json<Vec<DiseaseCatalogDto>>, (StatusCode, Json<Value>)> {
    
    let catalog = diseases_db::get_catalog(&pool)
        .await
        .map_err(|e| (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "message": format!("Eroare DB extragere catalog: {}", e) }))
        ))?;

    Ok(Json(catalog))
}

/// GET /api/diseases/patient/:id
pub async fn get_patient_conditions(State(pool): State<PgPool>, Path(patient_id): Path<Uuid>,Extension(_user): Extension<TokenPayload>,
) -> Result<Json<Vec<String>>, (StatusCode, Json<Value>)> {
    
    let conditions = diseases_db::get_patient_conditions(&pool, patient_id)
        .await
        .map_err(|e| (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "message": format!("Eroare extragere boli pacient: {}", e) }))
        ))?;

    Ok(Json(conditions))
}

/// PUT /api/diseases/patient/:id
pub async fn update_patient_conditions(State(pool): State<PgPool>, Path(patient_id): Path<Uuid>, Extension(_user): Extension<TokenPayload>,
Json(payload): Json<UpdateConditionsDto>,) -> Result<StatusCode, (StatusCode, Json<Value>)> {
    diseases_db::save_patient_conditions(&pool, patient_id, &payload.conditions)
        .await
        .map_err(|e| (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "message": format!("Eroare salvare afecțiuni: {}", e) }))
        ))?;

    Ok(StatusCode::OK)
}