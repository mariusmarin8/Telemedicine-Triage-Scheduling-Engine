use axum::{extract::Request, http::{header, StatusCode}, middleware::Next, response::IntoResponse,};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use std::env;
use uuid::Uuid;


#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TokenPayload {
    pub user_id: Uuid, // ID-ul utilizatorului
    pub role: String, // rolul utilizatorului (ex: "doctor", "pacient", "admin")
    pub exp: usize, //data expirarii tokenului
}

pub fn generate_token(user_id: Uuid, role: &str) -> Result<String, jsonwebtoken::errors::Error> {
    let secret = env::var("JWT_SECRET").expect("JWT_SECRET must be set");
    let expiration = chrono::Utc::now()
        .checked_add_signed(chrono::Duration::hours(24)) //tokenul va expira dupa 24 de ore
        .expect("valid timestamp").timestamp() as usize; 

    let token_payload = TokenPayload {
        user_id,
        role: role.to_string(),
        exp: expiration,
    };
    //returneaza tokenul generat
    encode(&Header::default(), &token_payload, &EncodingKey::from_secret(secret.as_ref()))
}

pub async fn require_auth(mut req: Request, next: Next) -> Result<impl IntoResponse, (StatusCode, &'static str)> {
    let auth_header = req.headers().get(header::AUTHORIZATION).and_then(|h| h.to_str().ok()); //extrage headerul de autorizare si daca este valid, il converteste la string, daca nu, returneaza None
    
    let auth_header = match auth_header {
        Some(header) => header, //daca headerul exista, continua procesarea
        None => return Err((StatusCode::UNAUTHORIZED, "Missing Authorization header")), //daca nu exista headerul de autorizare, returneaza eroare 401
    };

    //verific corectiutinea formatului: ""Bearer <token>""
    if !auth_header.starts_with("Bearer ") {
        return Err((StatusCode::UNAUTHORIZED, "Invalid Authorization header format"));
    }

    let token = &auth_header[7..]; //extrage tokenul din header (elimina "Bearer ")

    let secret = env::var("JWT_SECRET").expect("JWT_SECRET must be set");

    //decodific tokenul cu cheia secreta si verifica validitatea lui, daca este valid, continua procesarea, daca nu, returneaza eroare 401
    let token_data = match decode::<TokenPayload>(
        token,
        &DecodingKey::from_secret(secret.as_ref()),
        &Validation::default(),
    ) {
        Ok(data) => data, //daca tokenul este valid, continua procesarea
        Err(_) => return Err((StatusCode::UNAUTHORIZED, "Invalid or expired token")), //daca tokenul nu este valid sau a expirat, returneaza eroare 401
    };

    //continua procesarea cu datele din token
    req.extensions_mut().insert(token_data.claims);
    Ok(next.run(req).await)
}