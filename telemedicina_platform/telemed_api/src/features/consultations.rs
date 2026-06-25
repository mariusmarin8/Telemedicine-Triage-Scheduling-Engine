pub mod dto;
pub mod handler;
pub mod db;
use axum::{Router, routing::get};
use sqlx::PgPool;
use crate::features::consultations::handler::get_patient_medical_records;

pub fn consultations_routes(pool: PgPool) -> Router {
    Router::new()
        .route("/medical-records", get(get_patient_medical_records))
        .with_state(pool)
}   


