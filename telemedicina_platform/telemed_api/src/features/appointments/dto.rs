use serde::Serialize;
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Serialize, sqlx::FromRow)]
pub struct PatientAppointmentHistoryDTO {
    pub id: Uuid,
    pub doctor_name: String,
    pub specialty: String,
    pub start_time: DateTime<Utc>,
    pub end_time: DateTime<Utc>,
    pub status: String,
    pub primary_diagnosis: Option<String>,
    pub patient_name: String,
}