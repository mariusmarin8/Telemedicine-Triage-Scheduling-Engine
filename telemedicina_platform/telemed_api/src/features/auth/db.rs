use sqlx::{PgPool, postgres::PgRow};
use crate::features::auth::dto::*;
use uuid::Uuid;

/// Înregistrează utilizatorul apelând funcția Master din PL/pgSQL
pub async fn register_user_db(pool: &PgPool, req: RegisterRequest) -> Result<PgRow, sqlx::Error> {
    sqlx::query(
        "SELECT success, message, patient_id FROM register_new_patient($1, $2, $3, $4, $5, $6, $7::gender_enum, $8)"
    )
    .bind(&req.first_name)
    .bind(&req.last_name)
    .bind(&req.email)
    .bind(&req.password)
    .bind(&req.phone_number)
    .bind(req.date_of_birth)
    .bind(&req.gender)
    .bind(&req.cnp) 
    .fetch_one(pool)
    .await
}

pub async fn authenticate_user_db(pool: &PgPool, email: &str, password: &str) -> Result<Option<Uuid>, sqlx::Error> {
    let result = sqlx::query!(
        "SELECT id FROM patients WHERE email = $1 AND password_hash = crypt($2, password_hash) AND parent_id IS NULL",
        email, 
        password
    )
    .fetch_optional(pool)
    .await?;

    Ok(result.map(|r| r.id))
}

pub async fn register_doctor_db(pool: &PgPool, req: RegisterDoctorRequest) -> Result<PgRow, sqlx::Error> {
    sqlx::query(
        "SELECT success, message, doctor_id FROM register_new_doctor($1, $2, $3, $4, $5, $6, $7::medical_specialty)"
    )
    .bind(&req.first_name)
    .bind(&req.last_name)
    .bind(&req.email)
    .bind(&req.password)
    .bind(&req.phone)
    .bind(&req.license_number)
    .bind(&req.specialty) // Aici trimiți string-ul (ex: "Cardiologie"), Postgres îl va cast-a la ENUM
    .fetch_one(pool)
    .await
}

pub async fn authenticate_doctor_db(pool: &PgPool, email: &str, password: &str) -> Result<Option<Uuid>, sqlx::Error> {
    let result = sqlx::query!(
        "SELECT id FROM doctors WHERE email = $1 AND password_hash = crypt($2, password_hash)",
        email, 
        password
    )
    .fetch_optional(pool)
    .await?;

    Ok(result.map(|r| r.id))
}