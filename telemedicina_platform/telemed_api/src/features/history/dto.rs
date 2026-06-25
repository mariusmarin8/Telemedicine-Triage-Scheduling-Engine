use serde::Serialize;
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Serialize, sqlx::FromRow)]
pub struct PatientHistoryDTO {
    pub id: Uuid,
    pub record_type: String, // Va fi "TRIAJ" sau "CONSULTATIE"
    pub event_date: DateTime<Utc>,
    pub main_title: String,
    pub subtitle: String,
    pub diagnosis: String,
    pub details: String,
    pub medication_list: String,
    pub medication_instructions: String,
    pub referral_type: String,       
    pub referral_details: String,
}