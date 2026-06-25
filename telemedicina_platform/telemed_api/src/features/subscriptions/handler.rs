use axum::{extract::State, http::StatusCode, Extension, Json};
use serde_json::{json, Value};
use sqlx::PgPool;
use crate::middleware::auth::TokenPayload;
use crate::features::subscriptions::db;
use crate::features::subscriptions::dto::SubscriptionPayload;

pub async fn purchase_subscription(
    State(pool): State<PgPool>,
    Extension(user): Extension<TokenPayload>,
    Json(payload): Json<SubscriptionPayload>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
   
    db::insert_subscription_payment_db(
        &pool, 
        user.user_id, 
        &payload.plan_type, 
        &payload.billing_cycle
    )
    .await
    .map_err(|e| {
        eprintln!("Eroare DB la abonare: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({"message": "Nu am putut procesa abonamentul."}))
        )
    })?;

    Ok(Json(json!({
        "message": "Abonamentul a fost activat cu succes!",
        "status": "success"
    })))
}