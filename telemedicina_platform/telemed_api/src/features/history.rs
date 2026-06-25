pub mod dto;
pub mod handler;
pub mod db;

use axum::{Router, routing::get};
use sqlx::PgPool;

pub fn history_routes(pool: PgPool) -> Router {
    Router::new()
        .route("/all-records", get(handler::get_patient_history))
        .with_state(pool)
}