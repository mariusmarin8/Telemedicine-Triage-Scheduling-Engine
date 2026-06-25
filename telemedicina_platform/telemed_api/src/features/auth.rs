pub mod db;
pub mod dto;
pub mod handler;

use axum::{Router, routing::post};
use sqlx::PgPool;

pub fn auth_routes(pool: PgPool) -> Router {
    Router::new()
        .route("/register", post(handler::register_patient))
        .route("/login", post(handler::login_patient))
        .route("/doctor/register", post(handler::register_doctor))
        .route("/doctor/login", post(handler::login_doctor))
        .with_state(pool)
}