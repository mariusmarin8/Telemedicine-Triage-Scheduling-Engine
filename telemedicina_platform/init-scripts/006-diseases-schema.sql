
CREATE TABLE diseases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(100),
    is_auto_treatable BOOLEAN DEFAULT FALSE, 
    default_complexity INT CHECK (default_complexity BETWEEN 1 AND 5) DEFAULT 3
);

-- boli predefinite
INSERT INTO diseases (name, category) VALUES 
('Diabet', 'Cronic'),
('Hipertensiune', 'Cronic'),
('Alergii', 'Imunologic'),
('Afecțiuni digestive recurente', 'Digestiv'),
('Afecțiuni respiratorii cronice', 'Respirator'),
('Afecțiuni cardiovasculare', 'Cardiologic'),
('Astm', 'Respirator'),
('Migrene recurente', 'Neurologic'),
('Probleme gastrice / gastrită', 'Digestiv'),
('Probleme renale', 'Urologic'),
('Probleme hepatice', 'Gastroenterologic');


CREATE TABLE patient_conditions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    disease_id UUID REFERENCES diseases(id) ON DELETE CASCADE,
    diagnosed_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


CREATE INDEX idx_patient_conditions_patient ON patient_conditions(patient_id);

CREATE TABLE treatments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL, --paracetamol, ibuprofen, etc.
    category TEXT CHECK (category IN ('medication', 'supplement', 'lifestyle_advice')),
    general_instructions TEXT -- ex: "1 comprimat la 8 ore, maxim 3/zi"
);

CREATE TABLE disease_treatments (
    disease_id UUID REFERENCES diseases(id) ON DELETE CASCADE,
    treatment_id UUID REFERENCES treatments(id) ON DELETE CASCADE,
    specific_instructions TEXT, -- instrucțiuni specifice pentru această afecțiune
    PRIMARY KEY (disease_id, treatment_id)
);