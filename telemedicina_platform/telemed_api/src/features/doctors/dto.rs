use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Serialize, sqlx::FromRow)]
pub struct DoctorProfileDTO {
    pub id: Uuid,
    pub first_name: String,
    pub last_name: String,
    pub specialty: String,
    pub license_number: String,
}

#[derive(Serialize, sqlx::FromRow)]
pub struct DoctorAppointmentDTO {
    pub id: Uuid,
    pub patient_name: String,
    pub primary_diagnosis: Option<String>,
    pub patient_answers: serde_json::Value,
    pub complexity_level: Option<i32>,
    pub start_time: DateTime<Utc>,
}

#[derive(Deserialize)]
pub struct FinalizeConsultationInput {
    pub appointment_id: Uuid,
    pub final_diagnosis: String,
    pub recommendations: String,
    pub medication_list: Option<String>,
    pub referral_type: Option<String>,
    pub referral_details: Option<String>,
}

