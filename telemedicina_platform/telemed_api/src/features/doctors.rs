pub mod dto;
pub mod handler;
pub mod db;
use axum::{Router, routing::get, routing::post};
use sqlx::PgPool;

pub fn doctors_routes(pool: PgPool) -> Router {
    Router::new()
        .route(
            "/profile",
            get(handler::get_doctor_profile), 
        )
        .route(
            "/appointments",
            get(handler::list_doctor_appointments),
        )
        .route(
            "/finalize-consultation",
            post(handler::finalize_consultation),
        )
        .route(
            "/history",
            get(handler::get_doctor_history_handler),
        )
        .route(
            "/patients",
            get(handler::list_all_patients_handler),
        )
        .with_state(pool)
}