pub mod dto;
pub mod handler;
pub mod db;
use axum::{Router, routing::get, routing::put};
use sqlx::PgPool;


pub fn patient_routes(pool: PgPool) -> Router {
    Router::new()
        // profilul utilizatorului logat
        .route(
            "/profile",
            get(handler::get_my_profile),
        )

        // profil minor aflat sub tutela utilizatorului
        .route(
            "/profile/minor/:id",
            get(handler::get_minor_profile),
        )

        // listare minori + adăugare minor
        .route(
            "/minors",
            get(handler::list_minors)
                .post(handler::add_minor),
        )

        // actualizare minor
        .route(
            "/minors/:id",
            put(handler::update_minor),
        )

        .with_state(pool)

}