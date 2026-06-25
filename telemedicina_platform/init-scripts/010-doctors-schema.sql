CREATE TYPE medical_specialty AS ENUM (
    'Medicină Generală', 'Cardiologie', 'Gastroenterologie','Neurologie',
    'Pneumologie','ORL','Urologie','Ortopedie','Oftalmologie','Dermatologie',
    'Alergologie','Psihiatrie','Ginecologie','Pediatrie'
);


CREATE TABLE IF NOT EXISTS doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    license_number VARCHAR(20) UNIQUE NOT NULL, -- parafa medicului
    specialty medical_specialty NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS doctor_shifts (
    id SERIAL PRIMARY KEY,
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
    day_of_week INTEGER CHECK (day_of_week BETWEEN 1 AND 7), -- 1 = Luni, 7 = Duminică
    start_time TIME NOT NULL,
    end_time TIME NOT NULL
);