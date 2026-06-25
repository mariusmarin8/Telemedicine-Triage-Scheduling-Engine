use serde::{Deserialize, Serialize};
use chrono::{NaiveDate, DateTime, Utc};
use uuid::Uuid;
use sqlx::Type;
use std::fmt;


#[derive(Debug, Serialize, Deserialize, Type)]
#[sqlx(type_name = "gender_enum", rename_all = "PascalCase")]
pub enum GenderEnum {
    M,
    F,
}

#[derive(Debug, Serialize, Deserialize, Type)]
#[sqlx(type_name = "tutorship_enum", rename_all = "PascalCase")]
pub enum TutorshipEnum {
    Fiu,
    Fiica,
    #[sqlx(rename = "Persoana_reprezentata")]
    PersoanaReprezentata,
}

impl fmt::Display for GenderEnum {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            GenderEnum::M => write!(f, "M"),
            GenderEnum::F => write!(f, "F"),
        }
    }
}

impl fmt::Display for TutorshipEnum {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            TutorshipEnum::Fiu => write!(f, "Fiu"),
            TutorshipEnum::Fiica => write!(f, "Fiica"),
            TutorshipEnum::PersoanaReprezentata => write!(f, "Persoana_reprezentata"),
        }
    }
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct ProfileResponse {
    pub id: Uuid,
    pub first_name: String,
    pub last_name: String,
    pub cnp: String,
    pub date_of_birth: NaiveDate,
    pub age: i32,
    pub gender: GenderEnum,
    pub email: Option<String>,
    pub phone_number: Option<String>,
    pub subscription_type: Option<String>,
    pub subscription_expires_at: Option<NaiveDate>,
    pub created_at: DateTime<Utc>,
    pub total_consultations: i64,
    pub total_prescriptions: i64,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct MinorProfileResponse {
    pub id: Uuid,
    pub first_name: String,
    pub last_name: String,
    pub cnp: String,
    pub date_of_birth: NaiveDate,
    pub age: i32,
    pub gender: GenderEnum,
    pub parent_id: Option<Uuid>,
    pub relationship: TutorshipEnum,
    pub subscription_type: Option<String>,
    pub subscription_expires_at: Option<NaiveDate>,
    pub created_at: DateTime<Utc>,
    pub total_consultations: i64,
    pub total_prescriptions: i64,
}

#[derive(Debug, Deserialize)]
pub struct MinorRequest {
    pub first_name: String,
    pub last_name: String,
    pub date_of_birth: NaiveDate,
    pub gender: GenderEnum,
    pub cnp: String,
    pub relationship: TutorshipEnum,
}

#[derive(Debug, Serialize)]
pub struct SubscriptionInfo {
    pub plan_type: String,
    pub expires_at: Option<NaiveDate>,
}

#[derive(Debug, Serialize)]
pub struct MedicalInfo {
    pub chronic_conditions: Vec<String>,
    pub current_medications: Vec<String>,
}