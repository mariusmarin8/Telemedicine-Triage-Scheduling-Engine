pub mod dto;
pub mod handler;
pub mod db;
use axum::{Router, routing::{post, get}};
use sqlx::PgPool;

pub fn triage_routes(pool: PgPool) -> Router {
    Router::new()
        // Rutele noi pentru motorul de triaj
        .route(
            "/patient/:id/generate", 
            post(handler::generate_form)
        )
        .route(
            "/patient/:id/evaluate", 
            post(handler::evaluate_answers)
        )
        .route(
            "/symptoms", 
            get(handler::get_symptoms)
        )
        .route("/record/:id", get(handler::get_medical_record_handler))
        .with_state(pool)
}
