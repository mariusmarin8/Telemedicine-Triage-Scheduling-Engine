use serde::Serialize;
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Serialize, sqlx::FromRow)]
pub struct PatientMedicalRecordDTO {
    pub consultation_id: Uuid,
    pub consultation_date: DateTime<Utc>,
    pub doctor_name: String,
    pub specialty: String,
    pub final_diagnosis: String,
    pub recommendations: String,
    pub medication_list: String,
    pub medication_instructions: String,
    pub referral_type: String,       
    pub referral_details: String,
}