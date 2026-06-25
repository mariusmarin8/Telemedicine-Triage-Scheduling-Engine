CREATE OR REPLACE FUNCTION register_new_doctor(
    p_first_name VARCHAR, 
    p_last_name VARCHAR, 
    p_email VARCHAR,
    p_password_plain VARCHAR, 
    p_phone VARCHAR, 
    p_license_number VARCHAR,
    p_specialty medical_specialty
) RETURNS TABLE (success BOOLEAN, message TEXT, doctor_id UUID) AS $$
DECLARE 
    v_id UUID; 
BEGIN
    -- Inserăm doctorul, hash-uind parola exact ca la pacienți
    INSERT INTO doctors (first_name, last_name, email, password_hash, phone, license_number, specialty)
    VALUES (p_first_name, p_last_name, p_email, crypt(p_password_plain, gen_salt('bf')), p_phone, p_license_number, p_specialty)
    RETURNING id INTO v_id;

    RETURN QUERY SELECT TRUE, 'Contul de medic a fost creat cu succes.'::TEXT, v_id;
EXCEPTION
    WHEN unique_violation THEN
        RETURN QUERY SELECT FALSE, CASE
            WHEN sqlerrm LIKE '%doctors_email_key%' THEN 'Acest email este deja utilizat de alt medic.'
            WHEN sqlerrm LIKE '%doctors_license_number_key%' THEN 'Acest cod de parafă (licență) există deja în sistem.'
            ELSE 'Eroare: Date duplicate detectate.'
        END::TEXT, NULL::UUID;
    WHEN OTHERS THEN
        RETURN QUERY SELECT FALSE, 'Eroare neprevăzută la înregistrarea medicului.'::TEXT, NULL::UUID;
END;
$$ LANGUAGE plpgsql;


DROP FUNCTION IF EXISTS get_doctor_profile(UUID);

CREATE OR REPLACE FUNCTION get_doctor_profile(p_doctor_id UUID)
RETURNS TABLE (
    id UUID,
    first_name VARCHAR,
    last_name VARCHAR,
    specialty TEXT, 
    license_number VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id,
        d.first_name,
        d.last_name,
        d.specialty::TEXT,
        d.license_number
    FROM doctors d
    WHERE d.id = p_doctor_id;
END;
$$ LANGUAGE plpgsql;

