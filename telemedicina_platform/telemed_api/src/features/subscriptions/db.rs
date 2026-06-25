use sqlx::PgPool;
use uuid::Uuid;

pub async fn insert_subscription_payment_db(
    pool: &PgPool,
    patient_id: Uuid,
    plan_type: &str,
    billing_cycle: &str,
) -> Result<(), sqlx::Error> {
    sqlx::query_scalar!(
        r#"SELECT purchase_subscription($1, $2, $3) AS "success!""#,
        patient_id,
        plan_type,
        billing_cycle
    )
    .fetch_one(pool)
    .await?;

    Ok(())
}