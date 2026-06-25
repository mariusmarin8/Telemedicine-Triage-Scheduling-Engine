use sqlx::PgPool;
use uuid::Uuid;
use super::dto::PatientMedicalRecordDTO;

pub async fn get_full_patient_medical_records_db(
    pool: &PgPool,
    patient_id: Uuid,
) -> Result<Vec<PatientMedicalRecordDTO>, sqlx::Error> {
    
    let records = sqlx::query_as!(
        PatientMedicalRecordDTO,
        r#"
        SELECT 
            consultation_id AS "consultation_id!",
            consultation_date AS "consultation_date!",
            doctor_name AS "doctor_name!",
            specialty AS "specialty!",
            final_diagnosis AS "final_diagnosis!",
            recommendations AS "recommendations!",
            medication_list AS "medication_list!",
            medication_instructions AS "medication_instructions!",
            referral_type AS "referral_type!",
            referral_details AS "referral_details!"
        FROM get_full_patient_medical_records($1)
        "#,
        patient_id
    )
    .fetch_all(pool)
    .await?;

    Ok(records)
}