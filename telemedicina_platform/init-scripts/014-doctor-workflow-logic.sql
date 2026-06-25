
CREATE OR REPLACE FUNCTION save_consultation_prescription(
    p_consultation_id UUID, 
    p_medication_list TEXT
) RETURNS VOID AS $$
BEGIN
    IF p_medication_list IS NOT NULL AND trim(p_medication_list) <> '' THEN
        INSERT INTO prescriptions (consultation_id, medication_list)
        VALUES (p_consultation_id, trim(p_medication_list));
    END IF;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION save_consultation_referral(
    p_consultation_id UUID, 
    p_referral_type VARCHAR, 
    p_referral_details TEXT
) RETURNS VOID AS $$
BEGIN
    IF p_referral_type IS NOT NULL AND trim(p_referral_type) <> '' THEN
        INSERT INTO medical_referrals (consultation_id, referral_type, details)
        VALUES (p_consultation_id, trim(p_referral_type), trim(p_referral_details));
    END IF;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION update_triage_status_after_consultation(
    p_triage_id UUID, 
    p_final_diagnosis TEXT
) RETURNS VOID AS $$
DECLARE
    v_original_diagnosis TEXT;
    v_new_category triage_diagnosis_category;
BEGIN
    SELECT primary_diagnosis INTO v_original_diagnosis 
    FROM patient_triage_records WHERE id = p_triage_id;

    IF LOWER(trim(COALESCE(v_original_diagnosis, ''))) = LOWER(trim(COALESCE(p_final_diagnosis, ''))) THEN
        v_new_category := 'diagnostic confirmat de medic'::triage_diagnosis_category;
    ELSE
        v_new_category := 'diagnostic modificat de medic'::triage_diagnosis_category;
    END IF;

   
   
    UPDATE patient_triage_records 
    SET diagnosis_category = v_new_category
    WHERE id = p_triage_id;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION finalize_doctor_consultation(
    p_appointment_id UUID,
    p_final_diagnosis TEXT,
    p_recommendations TEXT,
    p_medication_list TEXT,       
    p_referral_type VARCHAR,      
    p_referral_details TEXT       
) RETURNS BOOLEAN AS $$
DECLARE
    v_patient_id UUID;
    v_doctor_id UUID;
    v_triage_id UUID;
    v_consultation_id UUID;
    v_original_diagnosis TEXT;
BEGIN
   
    SELECT patient_id, doctor_id, triage_record_id 
    INTO v_patient_id, v_doctor_id, v_triage_id
    FROM appointments WHERE id = p_appointment_id;

  
    IF v_patient_id IS NULL OR v_doctor_id IS NULL THEN
        RETURN FALSE; 
    END IF;

   
    SELECT primary_diagnosis INTO v_original_diagnosis 
    FROM patient_triage_records WHERE id = v_triage_id;

    
    INSERT INTO consultations (
        patient_id, 
        doctor_id, 
        triage_record_id, 
        consultation_date, 
        provisional_diagnosis, 
        final_diagnosis, 
        recommendations
    )
    VALUES (
        v_patient_id, 
        v_doctor_id, 
        v_triage_id, 
        NOW(), 
        v_original_diagnosis, 
        trim(p_final_diagnosis), 
        trim(p_recommendations)
    )
    RETURNING id INTO v_consultation_id;

    PERFORM save_consultation_prescription(v_consultation_id, p_medication_list);
    PERFORM save_consultation_referral(v_consultation_id, p_referral_type, p_referral_details);
    PERFORM update_triage_status_after_consultation(v_triage_id, p_final_diagnosis);

    UPDATE appointments SET status = 'FINALIZAT' WHERE id = p_appointment_id;

    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION get_patient_history(p_patient_id UUID)
RETURNS TABLE (
    id UUID,
    record_type TEXT,
    event_date TIMESTAMPTZ,
    main_title TEXT, 
    subtitle TEXT,
    diagnosis TEXT, 
    details TEXT, 
    medication_list TEXT,
    medication_instructions TEXT,
    referral_type VARCHAR,
    referral_details TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tr.id AS id,
        'TRIAJ'::TEXT AS record_type,
        tr.created_at AS event_date,
        'Triaj Automat'::TEXT AS main_title,
        COALESCE(tr.diagnosis_category::TEXT, 'General')::TEXT AS subtitle,
        COALESCE(tr.primary_diagnosis, 'Fără diagnostic')::TEXT AS diagnosis,
        ('Nivel Complexitate: ' || COALESCE(tr.complexity_level, 0)::TEXT || ' | Necesită Medic: ' || CASE WHEN COALESCE(tr.requires_doctor, true) THEN 'Da' ELSE 'Nu' END)::TEXT AS details,
        'Fără rețetă'::TEXT AS medication_list,
        '-'::TEXT AS medication_instructions,
        'FĂRĂ_TRIMITERE'::VARCHAR AS referral_type,
        '-'::TEXT AS referral_details
    FROM patient_triage_records tr
    WHERE tr.patient_id = p_patient_id

    UNION ALL

    SELECT 
        c.id AS id,
        'CONSULTATIE'::TEXT AS record_type,
        c.consultation_date AS event_date,
        ('Dr. ' || d.first_name || ' ' || d.last_name)::TEXT AS main_title,
        d.specialty::TEXT AS subtitle,
        COALESCE(c.final_diagnosis, 'În așteptare')::TEXT AS diagnosis,
        COALESCE(c.recommendations, '-')::TEXT AS details,
        COALESCE(pr.medication_list, 'Fără rețetă')::TEXT AS medication_list,
        COALESCE(pr.instructions, '-')::TEXT AS medication_instructions,
        COALESCE(mr.referral_type, 'FĂRĂ_TRIMITERE')::VARCHAR AS referral_type,
        COALESCE(mr.details, '-')::TEXT AS referral_details
    FROM consultations c
    JOIN doctors d ON c.doctor_id = d.id
    LEFT JOIN prescriptions pr ON pr.consultation_id = c.id
    LEFT JOIN medical_referrals mr ON mr.consultation_id = c.id
    WHERE c.patient_id = p_patient_id
    ORDER BY event_date DESC;
END;
$$ LANGUAGE plpgsql;