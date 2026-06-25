use sqlx::PgPool;
use uuid::Uuid;

use crate::features::patients::dto::{
    GenderEnum,
    MinorProfileResponse,
    MinorRequest,
    ProfileResponse,
    TutorshipEnum,
};

pub async fn get_patient_profile_db(
    pool: &PgPool,
    patient_id: Uuid,
) -> Result<ProfileResponse, sqlx::Error> {
    let profile = sqlx::query_as!(
        ProfileResponse,
        r#"
        SELECT
            id AS "id!",
            first_name AS "first_name!",
            last_name AS "last_name!",
            cnp AS "cnp!",
            date_of_birth AS "date_of_birth!",
            age AS "age!",
            gender AS "gender!: GenderEnum",
            email,
            phone_number,
            subscription_type,
            subscription_expires_at,
            created_at AS "created_at!",
            
           
            COALESCE((SELECT COUNT(*) FROM patient_triage_records WHERE patient_id = $1), 0) AS "total_consultations!",
            
            COALESCE((
                SELECT COUNT(*) 
                FROM prescriptions pr 
                JOIN consultations c ON pr.consultation_id = c.id 
                WHERE c.patient_id = $1
            ), 0) AS "total_prescriptions!"
            
        FROM get_patient_profile($1)
        "#,
        patient_id
    )
    .fetch_optional(pool)
    .await?;

    match profile {
        Some(profile) => Ok(profile),
        None => Err(sqlx::Error::RowNotFound),
    }
}

pub async fn get_minor_profile_db(
    pool: &PgPool,
    requester_id: Uuid,
    target_id: Uuid,
) -> Result<MinorProfileResponse, sqlx::Error> {
    let profile = sqlx::query_as!(
        MinorProfileResponse,
        r#"
        SELECT
            id AS "id!",
            first_name AS "first_name!",
            last_name AS "last_name!",
            cnp AS "cnp!",
            date_of_birth AS "date_of_birth!",
            age AS "age!",
            gender AS "gender!: GenderEnum",
            parent_id,
            relationship AS "relationship!: TutorshipEnum", 
            subscription_type,
            subscription_expires_at,
            created_at AS "created_at!",
            
            COALESCE((SELECT COUNT(*) FROM patient_triage_records WHERE patient_id = $2), 0) AS "total_consultations!",
            
            COALESCE((
                SELECT COUNT(*) 
                FROM prescriptions pr 
                JOIN consultations c ON pr.consultation_id = c.id 
                WHERE c.patient_id = $2
            ), 0) AS "total_prescriptions!"
            
        FROM get_minor_profile($1, $2)
        "#,
        requester_id,
        target_id
    )
    .fetch_optional(pool)
    .await?;

    match profile {
        Some(profile) => Ok(profile),
        None => Err(sqlx::Error::RowNotFound),
    }
}

pub async fn get_minors_db(
    pool: &PgPool,
    parent_id: Uuid,
) -> Result<Vec<MinorProfileResponse>, sqlx::Error> {
    let minors = sqlx::query_as!(
        MinorProfileResponse,
        r#"
        SELECT
            m.id AS "id!",
            m.first_name AS "first_name!",
            m.last_name AS "last_name!",
            m.cnp AS "cnp!",
            m.date_of_birth AS "date_of_birth!",
            m.age AS "age!",
            m.gender AS "gender!: GenderEnum",
            m.parent_id,
            m.relationship AS "relationship!: TutorshipEnum", 
            m.subscription_type,
            m.subscription_expires_at,
            m.created_at AS "created_at!",
            
            COALESCE((SELECT COUNT(*) FROM patient_triage_records WHERE patient_id = m.id), 0) AS "total_consultations!",
        
            COALESCE((
                SELECT COUNT(*) 
                FROM prescriptions pr 
                JOIN consultations c ON pr.consultation_id = c.id 
                WHERE c.patient_id = m.id
            ), 0) AS "total_prescriptions!"
            
        FROM get_my_minors($1) m
        "#,
        parent_id
    )
    .fetch_all(pool)
    .await?;

    Ok(minors)
}

pub async fn add_minor_db(
    pool: &PgPool,
    parent_id: Uuid,
    req: &MinorRequest,
) -> Result<Uuid, String> {
    let row_result = sqlx::query!(
        r#"
        SELECT success, message, minor_id
        FROM add_minor_patient(
            $1::varchar,
            $2::varchar,
            $3::date,
            $4::text::gender_enum,
            $5::char(13),
            $6::uuid,
            $7::text::tutorship_enum
        )
        "#,
        req.first_name,
        req.last_name,
        req.date_of_birth,
        req.gender.to_string(),
        req.cnp,
        parent_id,
        req.relationship.to_string() // fix: acum returnează "Persoana_reprezentata"
    )
    .fetch_one(pool)
    .await;

    match row_result {
        Ok(row) => {
            if row.success.unwrap_or(false) {
                Ok(row.minor_id.expect("minor_id should exist on success"))
            } else {
                Err(row.message.unwrap_or_else(|| "Eroare necunoscută".to_string()))
            }
        }
        Err(e) => {
            eprintln!("Eroare SQL: {:?}", e);
            Err("Eroare internă a serverului sau date invalide (ex: CNP deja existent).".to_string())
        }
    }
}

pub async fn update_minor_db(
    pool: &PgPool,
    parent_id: Uuid,
    minor_id: Uuid,
    req: MinorRequest,
) -> Result<bool, sqlx::Error> {
    let row = sqlx::query!(
        r#"
        SELECT update_minor_patient(
            $1::uuid,
            $2::uuid,
            $3::varchar,
            $4::varchar,
            $5::date,
            $6::text::gender_enum,
            $7::char(13),
            $8::text::tutorship_enum
        ) as "success!"
        "#,
        parent_id,
        minor_id,
        req.first_name,
        req.last_name,
        req.date_of_birth,
        req.gender.to_string(),
        req.cnp,
        req.relationship.to_string() 
    )
    .fetch_one(pool)
    .await?;

    Ok(row.success)
}