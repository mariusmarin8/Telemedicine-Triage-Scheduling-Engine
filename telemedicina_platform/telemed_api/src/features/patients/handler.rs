use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
    Extension,
    response::IntoResponse,
};
use sqlx::PgPool;
use uuid::Uuid;
use serde_json::{json, Value};
use crate::features::patients::dto::{MinorProfileResponse, ProfileResponse, MinorRequest};
use crate::features::patients::db as patient_db;
use crate::middleware::auth::TokenPayload;


/// GET /api/patients/me
pub async fn get_my_profile(
    State(pool): State<PgPool>,
    Extension(user): Extension<TokenPayload>,
) -> Result<Json<ProfileResponse>, (StatusCode, Json<Value>)> {
    let profile = patient_db::get_patient_profile_db(&pool, user.user_id)
        .await
        .map_err(|_| (
            StatusCode::NOT_FOUND,
            Json(json!({ "message": "Profil negăsit" })),
        ))?;

    Ok(Json(profile))
}


/// GET /api/patients/minor/profile/:id
pub async fn get_minor_profile(
    State(pool): State<PgPool>,
    Extension(user): Extension<TokenPayload>,
    Path(target_id): Path<Uuid>,
) -> Result<Json<MinorProfileResponse>, (StatusCode, Json<Value>)> {
    let profile = patient_db::get_minor_profile_db(&pool, user.user_id, target_id)
        .await
        .map_err(|e| match e {
            // fix: diferențiem RowNotFound (403) de erori de DB (500)
            sqlx::Error::RowNotFound => (
                StatusCode::FORBIDDEN,
                Json(json!({ "message": "Nu aveți acces la profilul acestui minor." })),
            ),
            _ => (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "message": "Eroare internă la obținerea profilului." })),
            ),
        })?;

    Ok(Json(profile))
}


/// GET /api/patients/minors
pub async fn list_minors(
    State(pool): State<PgPool>,
    Extension(user): Extension<TokenPayload>,
) -> Result<Json<Vec<MinorProfileResponse>>, (StatusCode, Json<Value>)> {
    let minors = patient_db::get_minors_db(&pool, user.user_id)
        .await
        .map_err(|e| (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "message": format!("Eroare la listarea minorilor: {}", e) })),
        ))?;

    Ok(Json(minors))
}


/// POST /api/patients/minors
pub async fn add_minor(
    State(pool): State<PgPool>,
    Extension(parent): Extension<TokenPayload>,
    Json(payload): Json<MinorRequest>,
) -> impl IntoResponse {
    match patient_db::add_minor_db(&pool, parent.user_id, &payload).await {
        Ok(new_patient_id) => (
            StatusCode::CREATED,
            Json(json!({
                "message": "Profilul a fost creat cu succes.",
                "id": new_patient_id
            })),
        ),
        Err(error_message) => (
            StatusCode::BAD_REQUEST,
            Json(json!({ "message": error_message })),
        ),
    }
}


/// PUT /api/patients/minors/:id
pub async fn update_minor(
    State(pool): State<PgPool>,
    Path(minor_id): Path<Uuid>,
    Extension(user): Extension<TokenPayload>,
    Json(payload): Json<MinorRequest>,
) -> Result<StatusCode, (StatusCode, Json<Value>)> {
    let success = patient_db::update_minor_db(&pool, user.user_id, minor_id, payload)
        .await
        .map_err(|e| (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "message": format!("Eroare la actualizare: {}", e) })),
        ))?;

    if !success {
        return Err((
            StatusCode::NOT_FOUND,
            Json(json!({ "message": "Minorul nu a fost găsit sau nu aveți permisiunea de a-l edita." })),
        ));
    }

    Ok(StatusCode::OK)
}