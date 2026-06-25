pub mod dto;
pub mod handler;
pub mod db;
use axum::{Router, routing::get};
use sqlx::PgPool;
use crate::features::appointments::handler::get_patient_appointments_history;
pub fn appointments_routes(pool: PgPool) -> Router {
    Router::new()
        .route("/history", get(get_patient_appointments_history))
        .with_state(pool)
}