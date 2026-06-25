CREATE OR REPLACE FUNCTION get_complete_medical_history(p_id UUID)
RETURNS TABLE (
    data_consultatie TIMESTAMPTZ,
    doctor VARCHAR,
    diagnostic TEXT,
    recomandari TEXT
) AS $$
BEGIN
    RETURN QUERY 
    SELECT consultation_date, doctor_name, diagnosis, recommendations
    FROM consultations 
    WHERE patient_id = p_id 
    ORDER BY consultation_date DESC;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION get_full_patient_medical_records(p_patient_id UUID)
RETURNS TABLE (
    consultation_id UUID,
    consultation_date TIMESTAMPTZ,
    doctor_name TEXT,
    specialty TEXT,
    final_diagnosis TEXT,
    recommendations TEXT,
    medication_list TEXT,
    medication_instructions TEXT, 
    referral_type VARCHAR,
    referral_details TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.consultation_date,
        (d.first_name || ' ' || d.last_name)::TEXT AS doctor_name,
        d.specialty::TEXT,
        COALESCE(c.final_diagnosis, 'În așteptare')::TEXT,
        COALESCE(c.recommendations, '-')::TEXT,
        COALESCE(pr.medication_list, 'Fără rețetă')::TEXT,
        COALESCE(pr.instructions, '-')::TEXT, 
        COALESCE(mr.referral_type, 'FĂRĂ_TRIMITERE')::VARCHAR,
        COALESCE(mr.details, '-')::TEXT
    FROM consultations c
    JOIN doctors d ON c.doctor_id = d.id
    LEFT JOIN prescriptions pr ON pr.consultation_id = c.id
    LEFT JOIN medical_referrals mr ON mr.consultation_id = c.id
    WHERE c.patient_id = p_patient_id
    ORDER BY c.consultation_date DESC;
END;
$$ LANGUAGE plpgsql;