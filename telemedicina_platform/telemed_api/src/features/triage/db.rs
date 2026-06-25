use sqlx::PgPool;
use uuid::Uuid;
use serde_json::{Value, Map};
use crate::features::triage::dto::{TriageFormResponse, TriageDecisionResponse, SymptomDTO, MedicalRecordDTO};

pub async fn generate_triage_form_db(pool: &PgPool, patient_id: Uuid, symptom_ids: Vec<Uuid>) -> Result<TriageFormResponse, sqlx::Error> {
   
    let result = sqlx::query_as!(
        TriageFormResponse,
        r#"
        SELECT
            is_emergency,
            emergency_message,
            template_slug,
            form_structure
        FROM generate_triage_form($1, $2)
        "#,
        patient_id,
        &symptom_ids
    )
    .fetch_optional(pool)
    .await?;

    match result {
        Some(res) => Ok(res),
        None => Err(sqlx::Error::RowNotFound),
    }
}

pub async fn evaluate_triage_answer_db(pool: &PgPool, patient_id: Uuid, template_slug: &str, answers: Value) -> Result<TriageDecisionResponse, sqlx::Error> {
    let template_id: Uuid = sqlx::query_scalar!(
        "SELECT id FROM evaluation_templates WHERE slug = $1",
        template_slug
    )
    .fetch_one(pool)
    .await?;
    
    let result = sqlx::query_as!(
        TriageDecisionResponse,
        r#"
        SELECT
            primary_diagnosis,
            complexity_level,
            requires_doctor,
            recommended_treatments,
            message,
            diagnosis_category,
            record_id
        FROM evaluate_triage_answers($1, $2, $3)
        "#,
        patient_id,
        template_id,
        answers
    )
    .fetch_optional(pool)
    .await?;

    match result {
        Some(res) => Ok(res),
        None => Err(sqlx::Error::RowNotFound),
    }
}

pub async fn get_all_symptoms_db(pool: &PgPool) -> Result<Vec<SymptomDTO>, sqlx::Error> {
    let symptoms = sqlx::query_as!(
        SymptomDTO,
        r#"
        SELECT id, name 
        FROM symptoms 
        ORDER BY name ASC
        "#,
    )
    .fetch_all(pool)
    .await?;

    Ok(symptoms)
}


pub async fn get_record_db(
    pool: &PgPool, 
    record_id: Uuid
) -> Result<MedicalRecordDTO, sqlx::Error> {
    let mut record = sqlx::query_as!(
        MedicalRecordDTO,
        r#"
        SELECT 
            id as "id!", patient_name as "patient_name!", patient_cnp as "patient_cnp!",
            age as "age!", gender as "gender!", consultation_date as "consultation_date!",
            symptoms_list as "symptoms_list!", answers as "answers!", diagnosis as "diagnosis!",
            diagnosis_category as "diagnosis_category!", complexity as "complexity!",
            doctor_needed as "doctor_needed!", recommendations as "recommendations!",
            form_structure as "form_structure" -- <--- Adăugat în query
        FROM get_medical_record_final($1)
        "#,
        record_id
    )
    .fetch_one(pool)
    .await?;

    if let Some(answers_obj) = record.answers.as_object() {
        let mut mapped_answers = Map::new();
        
        for (key, value) in answers_obj.iter() {
            let mut real_question = key.clone();

            if let Some(fs) = &record.form_structure {
                if let Some(questions_array) = fs.get("questions").and_then(|q| q.as_array()) {
                    for item in questions_array {
                        if item.get("id").and_then(|v| v.as_str()) == Some(key) {
                            if let Some(text_str) = item.get("text").and_then(|t| t.as_str()) {
                                real_question = text_str.to_string();
                                break; 
                            }
                        }
                    }
                }
            }
            mapped_answers.insert(real_question, value.clone());
        }
        record.answers = Value::Object(mapped_answers);
    }

    Ok(record)
}
