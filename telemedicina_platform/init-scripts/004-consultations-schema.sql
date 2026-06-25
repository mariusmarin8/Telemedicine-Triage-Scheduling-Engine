DROP TABLE IF EXISTS medical_referrals CASCADE;
DROP TABLE IF EXISTS prescriptions CASCADE;
DROP TABLE IF EXISTS consultations CASCADE;

CREATE TABLE IF NOT EXISTS consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL, 
    triage_record_id UUID REFERENCES patient_triage_records(id) ON DELETE SET NULL,
    
    consultation_date TIMESTAMPTZ DEFAULT NOW(),
    provisional_diagnosis TEXT, 
    final_diagnosis TEXT,       
    recommendations TEXT,
    status VARCHAR(20) DEFAULT 'Finalizată'
);


CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
    medication_list TEXT NOT NULL,
    instructions TEXT,
    issued_at TIMESTAMPTZ DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS medical_referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
    referral_type VARCHAR(50) CHECK (referral_type IN ('SPITAL', 'INVESTIGATII_SUPLIMENTARE', 'SPECIALIST')),
    details TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_consultations_patient ON consultations(patient_id);
CREATE INDEX idx_prescriptions_consultation ON prescriptions(consultation_id);