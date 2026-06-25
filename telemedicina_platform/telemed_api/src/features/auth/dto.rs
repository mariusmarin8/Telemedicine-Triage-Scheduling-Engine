use serde::{Deserialize, Serialize};
use chrono::NaiveDate;
use uuid::Uuid;

#[derive(Deserialize)]
pub struct RegisterRequest {
    pub first_name: String,
    pub last_name: String,
    pub email: String,
    pub password: String,
    pub phone_number: Option<String>,
    pub date_of_birth: NaiveDate,
    pub gender: String,
    pub cnp: String,
}

#[derive(Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Serialize)]
pub struct AuthResponse {
    pub token: Option<String>,
    pub role: String,
    pub message: String,
    pub user_id: Option<Uuid>,
}

#[derive(serde::Deserialize)]
pub struct RegisterDoctorRequest {
    pub first_name: String,
    pub last_name: String,
    pub email: String,
    pub password: String,
    pub phone: String,
    pub license_number: String,
    pub specialty: String,
}