use sqlx::PgPool;
use uuid::Uuid;
use super::dto::{DoctorProfileDTO, DoctorAppointmentDTO, FinalizeConsultationInput};


pub async fn get_doctor_profile_db(
    pool: &PgPool,
    doctor_id: Uuid,
) -> Result<DoctorProfileDTO, sqlx::Error> {
    sqlx::query_as!(
        DoctorProfileDTO,
        r#"
        SELECT 
            id AS "id!", 
            first_name AS "first_name!", 
            last_name AS "last_name!", 
            specialty AS "specialty!: String", 
            license_number AS "license_number!" 
        FROM get_doctor_profile($1::uuid)
        "#,
        doctor_id
    )
    .fetch_one(pool)
    .await
}


pub async fn get_doctor_appointments_db(
    pool: &PgPool,
    doctor_id: Uuid,
) -> Result<Vec<DoctorAppointmentDTO>, sqlx::Error> {
    sqlx::query_as!(
        DoctorAppointmentDTO,
        r#"
        SELECT 
            id AS "id!", 
            patient_name AS "patient_name!", 
            primary_diagnosis, 
            patient_answers AS "patient_answers!", 
            complexity_level, 
            start_time AS "start_time!" 
        FROM get_doctor_appointments($1::uuid)
        "#,
        doctor_id
    )
    .fetch_all(pool)
    .await
}


pub async fn finalize_consultation_db(
    pool: &PgPool,
    input: &FinalizeConsultationInput,
) -> Result<bool, sqlx::Error> {
    let row = sqlx::query!(
        "SELECT finalize_doctor_consultation($1, $2, $3, $4, $5, $6) as success",
        input.appointment_id,
        input.final_diagnosis,
        input.recommendations,
        input.medication_list,
        input.referral_type,
        input.referral_details
    )
    .fetch_one(pool)
    .await?;

    Ok(row.success.unwrap_or(false))
}