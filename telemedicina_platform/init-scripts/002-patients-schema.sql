CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE tutorship_enum AS ENUM ('Fiu', 'Fiica', 'Persoana_reprezentata');

CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    
    cnp CHAR(13) UNIQUE,
    date_of_birth DATE NOT NULL,
    gender gender_enum NOT NULL,
    email VARCHAR(255) UNIQUE, 
    password_hash VARCHAR(255),
    phone_number VARCHAR(20),
    parent_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    
    relationship tutorship_enum, 
    
    subscription_type VARCHAR(20) DEFAULT 'Niciunul' 
        CHECK (subscription_type IN ('Lunar', 'Anual', 'Niciunul')),
    subscription_expires_at DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_patient_type CHECK (
        (email IS NOT NULL AND password_hash IS NOT NULL AND parent_id IS NULL) OR 
        (parent_id IS NOT NULL)
    )
);




CREATE INDEX idx_patients_parent_id ON patients(parent_id);
CREATE INDEX idx_patients_cnp ON patients(cnp);


CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_patients_modtime
    BEFORE UPDATE ON patients
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

