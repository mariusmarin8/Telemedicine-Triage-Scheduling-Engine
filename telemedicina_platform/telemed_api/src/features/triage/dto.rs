use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use serde_json::Value;
use chrono::{DateTime, Utc};
#[derive(Deserialize)]
//simptomele primite de la React pentru a genera formularul
pub struct GenerateFormRequest {
    pub symptom_ids: Vec<Uuid>,
    pub patient_id: Option<Uuid>,
}

#[derive(Serialize, FromRow)]
pub struct TriageFormResponse {
    pub is_emergency: Option<bool>,
    pub emergency_message: Option<String>,
    pub template_slug: Option<String>,
    pub form_structure: Option<Value>, 
}

#[derive(Deserialize)]
//formularul completat de pacient, cu răspunsurile pentru a evalua complexitatea
pub struct EvaluateAnswersRequest {
    pub template_slug: String,
    pub answers: Value, //{"question_id": "answer", ...}
}

#[derive(Serialize, FromRow)]
pub struct TriageDecisionResponse {
    pub primary_diagnosis: Option<String>,
    pub complexity_level: Option<i32>,
    pub requires_doctor: Option<bool>,
    pub recommended_treatments: Option<Value>, // Array JSON cu medicamente
    pub message: Option<String>,
    pub diagnosis_category: Option<String>,
    pub record_id: Option<Uuid>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SymptomDTO {
    pub id: Uuid,
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[derive(sqlx::FromRow)]
pub struct MedicalRecordDTO {
    pub id: Uuid,
    pub patient_name: String,
    pub patient_cnp: String,
    pub age: i32,
    pub gender: String,
    pub consultation_date: DateTime<Utc>,
    pub symptoms_list: String,
    pub answers: serde_json::Value,
    pub diagnosis: String,
    pub diagnosis_category: String,
    pub complexity: i32,
    pub doctor_needed: bool,
    pub recommendations: String,
    pub form_structure: Option<serde_json::Value>,
}


#[derive(Debug, Serialize, Deserialize)]
pub struct MedicalRecordSummaryDTO {
    pub id: Uuid,
    pub patient_name: String,
    pub diagnosis: String,
    pub diagnosis_category: String,
    pub complexity: i32,
    pub doctor_needed: bool,
    pub consultation_date: DateTime<Utc>,
}