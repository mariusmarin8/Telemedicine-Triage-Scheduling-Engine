
CREATE OR REPLACE FUNCTION get_patient_age(p_dob DATE)
RETURNS INTEGER AS $$
    SELECT EXTRACT(YEAR FROM age(CURRENT_DATE, p_dob))::INTEGER;
$$ LANGUAGE sql STABLE;
 
 
CREATE OR REPLACE FUNCTION register_new_patient(
    p_first_name VARCHAR, p_last_name VARCHAR, p_email VARCHAR,
    p_password_plain VARCHAR, p_phone VARCHAR, p_dob DATE,
    p_gender gender_enum, p_cnp CHAR(13)
) RETURNS TABLE (success BOOLEAN, message TEXT, patient_id UUID) AS $$
DECLARE 
    v_id UUID; 
BEGIN
    IF get_patient_age(p_dob) < 18 THEN
        RETURN QUERY SELECT FALSE, 'Eroare: Trebuie să aveți peste 18 ani pentru un cont principal.'::TEXT, NULL::UUID; RETURN;
    END IF;
 
    INSERT INTO patients (first_name, last_name, email, password_hash, phone_number, date_of_birth, gender, cnp)
    VALUES (p_first_name, p_last_name, p_email, crypt(p_password_plain, gen_salt('bf')), p_phone, p_dob, p_gender, p_cnp)
    RETURNING id INTO v_id;
 
    RETURN QUERY SELECT TRUE, 'Cont creat cu succes.'::TEXT, v_id;
EXCEPTION
    WHEN unique_violation THEN
        RETURN QUERY SELECT FALSE, CASE
            WHEN sqlerrm LIKE '%patients_email_key%' THEN 'Acest email este deja utilizat.'
            WHEN sqlerrm LIKE '%patients_cnp_key%'   THEN 'Acest CNP există deja în sistem.'
            ELSE 'Eroare: Date duplicate detectate.'
        END::TEXT, NULL::UUID;
    WHEN OTHERS THEN
        RETURN QUERY SELECT FALSE, 'Eroare neprevăzută la înregistrare.'::TEXT, NULL::UUID;
END;
$$ LANGUAGE plpgsql;
 
 
CREATE OR REPLACE FUNCTION add_minor_patient(
    p_first_name VARCHAR, 
    p_last_name VARCHAR, 
    p_dob DATE,
    p_gender gender_enum, 
    p_cnp CHAR(13), 
    p_parent_id UUID,
    p_relationship tutorship_enum
) RETURNS TABLE (success BOOLEAN, message TEXT, minor_id UUID) AS $$
DECLARE 
    v_parent_age INTEGER;
    v_patient_age INTEGER;
    v_id UUID; 
BEGIN
    -- Calculăm vârsta tutorelui și a pacientului
    SELECT get_patient_age(date_of_birth) INTO v_parent_age FROM patients WHERE id = p_parent_id;
    v_patient_age := get_patient_age(p_dob);
 
    -- Validări Tutore
    IF v_parent_age IS NULL THEN
        RETURN QUERY SELECT FALSE, 'Eroare: Tutorele legal nu a fost găsit.'::TEXT, NULL::UUID; RETURN;
    ELSIF v_parent_age < 18 THEN
        RETURN QUERY SELECT FALSE, 'Eroare: Un minor nu poate fi reprezentant legal pentru altcineva.'::TEXT, NULL::UUID; RETURN;
    END IF;

    -- Validări Pacient (Fiu/Fiică vs Persoană Reprezentată)
    IF p_relationship IN ('Fiu', 'Fiica') AND v_patient_age >= 18 THEN
        RETURN QUERY SELECT FALSE, 'Eroare: Un fiu/fiică adăugat aici trebuie să fie minor. Persoanele majore trebuie să își creeze cont propriu.'::TEXT, NULL::UUID; RETURN;
    END IF;
 
    INSERT INTO patients (first_name, last_name, date_of_birth, gender, cnp, parent_id, relationship)
    VALUES (p_first_name, p_last_name, p_dob, p_gender, p_cnp, p_parent_id, p_relationship)
    RETURNING id INTO v_id;
 
    RETURN QUERY SELECT TRUE, 'Profilul pacientului dependent a fost creat cu succes.'::TEXT, v_id;
END;
$$ LANGUAGE plpgsql;
 
 

 
CREATE OR REPLACE FUNCTION update_patient_profile(p_id UUID, p_phone VARCHAR, p_email VARCHAR, p_cnp CHAR(13))
RETURNS BOOLEAN AS $$
    UPDATE patients SET phone_number = p_phone, email = p_email, cnp = p_cnp, updated_at = NOW()
    WHERE id = p_id RETURNING TRUE;
$$ LANGUAGE sql;
 
 

DROP FUNCTION IF EXISTS get_patient_profile(UUID);
DROP FUNCTION IF EXISTS get_my_minors(UUID);


CREATE OR REPLACE FUNCTION get_patient_profile(p_patient_id UUID)
RETURNS TABLE (
    id UUID,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    cnp CHAR(13),
    date_of_birth DATE,
    age INTEGER,
    gender gender_enum,
    email VARCHAR(255),
    phone_number VARCHAR(20),
    subscription_type VARCHAR(20),
    subscription_expires_at DATE,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.first_name, p.last_name, p.cnp, p.date_of_birth,
           get_patient_age(p.date_of_birth),
           p.gender, p.email, p.phone_number,
           p.subscription_type, p.subscription_expires_at, p.created_at
    FROM patients p
    WHERE p.id = p_patient_id;
END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION get_my_minors(p_parent_id UUID)
RETURNS TABLE (
    id UUID,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    cnp CHAR(13),
    date_of_birth DATE,
    age INTEGER,
    gender gender_enum,
    parent_id UUID,
    relationship tutorship_enum,
    subscription_type VARCHAR(20),
    subscription_expires_at DATE,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.first_name, p.last_name, p.cnp, p.date_of_birth,
           get_patient_age(p.date_of_birth),
           p.gender, p.parent_id, p.relationship,
           p.subscription_type, p.subscription_expires_at, p.created_at
    FROM patients p
    WHERE p.parent_id = get_my_minors.p_parent_id
    ORDER BY p.first_name ASC;
END;
$$ LANGUAGE plpgsql STABLE;
CREATE OR REPLACE FUNCTION get_minor_profile(p_requester_id UUID, p_target_id UUID)
RETURNS TABLE (id UUID, first_name VARCHAR(100), last_name VARCHAR(100), cnp CHAR(13), date_of_birth DATE, age INTEGER, gender gender_enum, parent_id UUID, relationship tutorship_enum, subscription_type VARCHAR(20), subscription_expires_at DATE, created_at TIMESTAMPTZ)
AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.first_name, p.last_name, p.cnp, p.date_of_birth, get_patient_age(p.date_of_birth),
           p.gender, p.parent_id, p.relationship, p.subscription_type,
           p.subscription_expires_at, p.created_at
    FROM patients p
    WHERE p.id = p_target_id
      AND p.parent_id = p_requester_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_minor_patient(
    p_parent_id UUID,
    p_minor_id UUID,
    p_first_name VARCHAR,
    p_last_name VARCHAR,
    p_date_of_birth DATE,
    p_gender gender_enum,
    p_cnp CHAR(13),
    p_relationship tutorship_enum
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE patients
    SET first_name = p_first_name,
        last_name = p_last_name,
        date_of_birth = p_date_of_birth,
        gender = p_gender,
        cnp = p_cnp,
        relationship = p_relationship,
        updated_at = NOW()
    WHERE id = p_minor_id AND parent_id = p_parent_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;