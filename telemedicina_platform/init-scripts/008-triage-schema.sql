CREATE TABLE symptoms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    body_system TEXT NOT NULL, -- ex: digestiv, respirator, etc.
    is_critical INT CHECK (is_critical BETWEEN 1 AND 3) -- o valoare de la 1 la 3
);


CREATE TABLE diseases_typical_symptoms (
    disease_id UUID REFERENCES diseases(id) ON DELETE CASCADE,
    symptom_id UUID REFERENCES symptoms(id) ON DELETE CASCADE,
    relevance_score INT CHECK (relevance_score BETWEEN 1 AND 5), -- o valoare de la 1 la 5
    PRIMARY KEY (disease_id, symptom_id)
);


CREATE TABLE evaluation_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL, -- ex: "Evaluare pentru dureri abdominale"
    slug TEXT UNIQUE NOT NULL, -- ex: "evaluare-dureri-abdominale" (pt. rute/API)
    speciality medical_specialty NOT NULL, -- ex: "Gastroenterologie"
    form_structure JSONB NOT NULL, -- definește ce întrebări să aibă formularul
    scoring_logic JSONB -- definește cum se calculează scorul de gravitate pe baza răspunsurilor
);


CREATE TABLE triage_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL, -- ex: "Regula pentru dureri abdominale severe"
    priority_level INT CHECK (priority_level BETWEEN 1 AND 5), -- 5 suprascrie o regulă de nivel 1
    target_disease_id UUID REFERENCES diseases(id) ON DELETE CASCADE,
    min_age INT,
    max_age INT,
    gender VARCHAR(10) CHECK (gender IN ('M', 'F', 'other', 'any')) DEFAULT 'any',

    symptom_match_mode VARCHAR(10) DEFAULT 'ANY' 
        CHECK (symptom_match_mode IN ('ALL', 'ANY', 'MIN_COUNT')),
    min_symptom_count INT DEFAULT 1,
    template_id UUID REFERENCES evaluation_templates(id) NOT NULL,
    is_emergency_alert BOOLEAN DEFAULT false, -- skip formular, alertă directă
    emergency_message TEXT -- mesajul afișat la urgență
);


CREATE TABLE triage_rule_symptoms (
    rule_id UUID REFERENCES triage_rules(id) ON DELETE CASCADE,
    symptom_id UUID REFERENCES symptoms(id) ON DELETE CASCADE,
    PRIMARY KEY (rule_id, symptom_id)
);

DROP TYPE IF EXISTS triage_diagnosis_category CASCADE;
CREATE TYPE triage_diagnosis_category AS ENUM (
    'diagnostic dat automat de sistem',
    'diagnostic provizoriu',
    'diagnostic confirmat de medic',
    'diagnostic modificat de medic'
);


CREATE TABLE patient_triage_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    template_id UUID REFERENCES evaluation_templates(id),
    patient_answers JSONB NOT NULL,
    primary_diagnosis TEXT,
    complexity_level INT,
    requires_doctor BOOLEAN,
    -- categoria diagnosticului la finalul triajului/înregistrării
    diagnosis_category triage_diagnosis_category,
    recommended_treatments JSONB,
    recommended_specialty medical_specialty,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


CREATE INDEX idx_triage_records_patient ON patient_triage_records(patient_id);