pub mod core;
pub mod features;
pub mod middleware;

use dotenvy::dotenv;

#[tokio::main]
async fn main() {
    dotenv().ok();

    let config = core::config::Config::from_env();

    println!("Connecting to the database...");
    let db_pool = core::db::create_db_pool(&config.database_url).await;
    println!("Database connection established.");

    let app = core::router::build(db_pool);

    let addr = std::net::SocketAddr::from(([127, 0, 0, 1], config.port));
    println!("Server starting on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .expect("Failed to bind to address");

    axum::serve(listener, app)
        .await
        .expect("Failed to start server");
}