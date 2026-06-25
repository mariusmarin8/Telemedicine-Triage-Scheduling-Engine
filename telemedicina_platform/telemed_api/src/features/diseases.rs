
pub mod dto;
pub mod handler;
pub mod db;

use axum::{Router, routing::get};
use sqlx::PgPool;

pub fn diseases_routes(pool: PgPool) -> Router {
    Router::new()
        .route("/catalog", get(handler::get_catalog))
        .route("/patient/:id", get(handler::get_patient_conditions).put(handler::update_patient_conditions))
        .with_state(pool)
}