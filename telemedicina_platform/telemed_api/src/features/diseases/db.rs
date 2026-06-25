use sqlx::PgPool;
use uuid::Uuid;
use super::dto::DiseaseCatalogDto;

pub async fn get_catalog(pool: &PgPool) -> Result<Vec<DiseaseCatalogDto>, sqlx::Error> {
    let catalog = sqlx::query_as!(
        DiseaseCatalogDto,
        r#"
        SELECT 
            disease_id AS "disease_id!", 
            disease_name AS "disease_name!", 
            category_name AS "category_name!" 
        FROM get_disease_catalog()
        "#
    )
    .fetch_all(pool)
    .await?;

    Ok(catalog)
}

pub async fn save_patient_conditions(
    pool: &sqlx::PgPool,
    patient_id: Uuid,
    conditions: &[String], 
) -> Result<(), sqlx::Error> {
    
    // 1. Folosim Uuid::parse_str în loc de Uuid::from
    let condition_uuids: Vec<Uuid> = conditions
        .iter()
        .filter_map(|id_str| Uuid::parse_str(id_str).ok()) // <-- Modificarea este aici
        .collect();

    // 2. Apelăm funcția SQL
    sqlx::query!(
        "SELECT save_patient_conditions($1, $2)",
        patient_id,
        &condition_uuids
    )
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn get_patient_conditions(
    pool: &PgPool, 
    patient_id: Uuid
) -> Result<Vec<String>, sqlx::Error> {
    
    let records = sqlx::query!(
        "SELECT condition_name FROM get_patient_conditions($1)",
        patient_id
    )
    .fetch_all(pool)
    .await?;

    
    let conditions: Vec<String> = records
        .into_iter()
        .filter_map(|r| r.condition_name) 
        .collect();

    Ok(conditions)
}