use sqlx::PgPool;
use uuid::Uuid;
use super::dto::PatientAppointmentHistoryDTO;

pub async fn get_patient_appointments_history_db(
    pool: &PgPool,
    patient_id: Uuid,
) -> Result<Vec<PatientAppointmentHistoryDTO>, sqlx::Error> {
    
    let appointments = sqlx::query_as!(
        PatientAppointmentHistoryDTO,
        r#"
        SELECT 
            id AS "id!", 
            doctor_name AS "doctor_name!", 
            specialty AS "specialty!", 
            start_time AS "start_time!", 
            end_time AS "end_time!", 
            status AS "status!", 
            primary_diagnosis AS "primary_diagnosis",
            patient_name AS "patient_name!" -- <-- Adăugat în macro-ul SQLx
        FROM get_patient_appointments_history($1)
        "#,
        patient_id
    )
    .fetch_all(pool)
    .await?;

    Ok(appointments)
}