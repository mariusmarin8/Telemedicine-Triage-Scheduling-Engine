use sqlx::{postgres::PgPoolOptions, PgPool};

pub async fn create_db_pool(database_url: &str) -> PgPool {
    PgPoolOptions::new()
        .max_connections(5)
        .connect(database_url)
        .await
        .expect("Nu s-a putut conecta la baza de date")
}