use serde::{Deserialize};

#[derive(Deserialize)]
pub struct SubscriptionPayload {
    pub plan_type: String,     
    pub billing_cycle: String,
}