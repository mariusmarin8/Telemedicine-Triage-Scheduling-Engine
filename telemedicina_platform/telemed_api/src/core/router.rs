use axum::{Router, middleware::from_fn, http::Method};
use tower_http::cors::{Any, CorsLayer}; 
use sqlx::PgPool;


pub fn build(db_pool: PgPool) -> Router {
    
    let cors = CorsLayer::new()
        .allow_origin(Any) 
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allow_headers(Any);

    let auth_routes = crate::features::auth::auth_routes(db_pool.clone());
    
    let patient_routes = crate::features::patients::patient_routes(db_pool.clone())
        .layer(from_fn(crate::middleware::auth::require_auth));

    let diseases_routes = crate::features::diseases::diseases_routes(db_pool.clone())
        .layer(from_fn(crate::middleware::auth::require_auth));

    let triage_routes = crate::features::triage::triage_routes(db_pool.clone())
        .layer(from_fn(crate::middleware::auth::require_auth));

    let doctors_routes = crate::features::doctors::doctors_routes(db_pool.clone())
        .layer(from_fn(crate::middleware::auth::require_auth));

    let appointments_routes = crate::features::appointments::appointments_routes(db_pool.clone())
        .layer(from_fn(crate::middleware::auth::require_auth));

    let consultations_routes = crate::features::consultations::consultations_routes(db_pool.clone())
        .layer(from_fn(crate::middleware::auth::require_auth));

    let history_routes = crate::features::history::history_routes(db_pool.clone())
        .layer(from_fn(crate::middleware::auth::require_auth));

    let subscriptions_routes = crate::features::subscriptions::subscriptions_routes(db_pool.clone())
        .layer(from_fn(crate::middleware::auth::require_auth));
    
    Router::new()
        .nest("/api/auth", auth_routes)
        .nest("/api/patients", patient_routes) 
        .nest("/api/diseases", diseases_routes)
        .nest("/api/triage", triage_routes)
        .nest("/api/doctors", doctors_routes)
        .nest("/api/appointments", appointments_routes)
        .nest("/api/consultations", consultations_routes)
        .nest("/api/history", history_routes)
        .nest("/api/subscriptions", subscriptions_routes)
        .layer(cors)
}