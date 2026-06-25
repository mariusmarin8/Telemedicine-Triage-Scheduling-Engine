use sqlx::PgPool;
use uuid::Uuid;
use super::dto::PatientHistoryDTO;

pub async fn get_patient_history_db(
    pool: &PgPool,
    patient_id: Uuid,
) -> Result<Vec<PatientHistoryDTO>, sqlx::Error> {
    
    let records = sqlx::query_as!(
        PatientHistoryDTO,
        r#"
        SELECT 
            id AS "id!",
            record_type AS "record_type!",
            event_date AS "event_date!",
            main_title AS "main_title!",
            subtitle AS "subtitle!",
            diagnosis AS "diagnosis!",
            details AS "details!",
            medication_list AS "medication_list!",
            medication_instructions AS "medication_instructions!",
            referral_type AS "referral_type!",
            referral_details AS "referral_details!"
        FROM get_patient_history($1)
        "#,
        patient_id
    )
    .fetch_all(pool)
    .await?;

    Ok(records)
}