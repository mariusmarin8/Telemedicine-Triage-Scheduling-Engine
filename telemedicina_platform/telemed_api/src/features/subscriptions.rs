pub mod dto;
pub mod handler;
pub mod db;

use axum::{Router, routing::post};
use sqlx::PgPool;
use crate::features::subscriptions::handler::purchase_subscription;

pub fn subscriptions_routes(pool: PgPool) -> Router {
    Router::new()
        .route("/purchase", post(purchase_subscription))
        .with_state(pool)
}