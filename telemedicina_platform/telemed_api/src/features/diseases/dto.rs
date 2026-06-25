use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// DTO pentru o boală din catalog (ce trimitem către React pentru a desena checkbox-urile)
#[derive(Debug, Serialize, Deserialize)]
pub struct DiseaseCatalogDto {
    pub disease_id: Uuid,
    pub disease_name: String,
    pub category_name: String,
}

/// DTO pentru datele primite de la React (când pacientul apasă "Salvează")
#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateConditionsDto {
    pub conditions: Vec<String>,
}