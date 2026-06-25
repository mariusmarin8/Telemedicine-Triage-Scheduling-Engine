DROP TYPE IF EXISTS triage_form_result CASCADE;
CREATE TYPE triage_form_result AS (
    is_emergency BOOLEAN,
    emergency_message TEXT,
    template_slug TEXT,
    form_structure JSONB
);

DROP TYPE IF EXISTS triage_decision_result CASCADE;
CREATE TYPE triage_decision_result AS (
    primary_diagnosis TEXT,
    complexity_level INT,
    requires_doctor BOOLEAN,
    recommended_treatments JSONB,
    message TEXT,
    diagnosis_category TEXT,
    record_id UUID
);

CREATE OR REPLACE FUNCTION get_treatments_for_disease(p_disease_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_treatments JSONB;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'nume', t.name,
            'categorie', t.category,
            'instructiuni_generale', t.general_instructions,
            'detalii_specifice', COALESCE(dt.specific_instructions, '-')
        )
    )
    INTO v_treatments
    FROM disease_treatments dt
    JOIN treatments t ON dt.treatment_id = t.id
    WHERE dt.disease_id = p_disease_id;

    RETURN v_treatments;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION generate_triage_form(
    p_patient_id UUID,
    p_symptom_ids UUID[]
) 
RETURNS triage_form_result AS $$
DECLARE
    v_age INT;
    v_gender VARCHAR(10);
    v_disease_ids UUID[];
    
    v_rule RECORD;
    v_rule_symptoms UUID[];
    v_match BOOLEAN;
    v_result triage_form_result;
BEGIN
    --varsta si genul pacientului
    SELECT get_patient_age(date_of_birth), gender 
    INTO v_age, v_gender FROM patients WHERE id = p_patient_id;

    --bolile existente ale pacientului
    SELECT array_agg(disease_id) INTO v_disease_ids 
    FROM patient_conditions WHERE patient_id = p_patient_id AND disease_id IS NOT NULL;
    
    --in cazul in care pacientul nu are nicio boală cunoscută, initializam cu un array gol pt a evita problemele cu NULL
    IF v_disease_ids IS NULL THEN 
        v_disease_ids := ARRAY[]::UUID[]; 
    END IF;

    --parcugere regulilor de triaj în ordinea priorității
    FOR v_rule IN SELECT * FROM triage_rules ORDER BY priority_level DESC LOOP
        IF v_rule.min_age IS NOT NULL AND v_age < v_rule.min_age THEN 
            CONTINUE; 
        END IF;
        IF v_rule.max_age IS NOT NULL AND v_age > v_rule.max_age THEN 
            CONTINUE; 
        END IF;
        IF v_rule.gender != 'any' AND v_rule.gender != v_gender THEN 
            CONTINUE; 
        END IF;
        IF v_rule.target_disease_id IS NOT NULL AND NOT (v_rule.target_disease_id = ANY(v_disease_ids)) THEN 
            CONTINUE; 
        END IF;

        -- extragem simptomele asociate regulii
        SELECT array_agg(symptom_id) INTO v_rule_symptoms FROM triage_rule_symptoms WHERE rule_id = v_rule.id;
        
        IF v_rule_symptoms IS NULL THEN v_rule_symptoms := ARRAY[]::UUID[]; END IF;

        -- Verificăm logic simptomele
        v_match := false;
        
        IF v_rule.symptom_match_mode = 'ALL' THEN
            IF v_rule_symptoms <@ p_symptom_ids THEN v_match := true; END IF;
        
        ELSIF v_rule.symptom_match_mode = 'ANY' THEN
            IF v_rule_symptoms && p_symptom_ids THEN v_match := true; END IF;
        
        ELSIF v_rule.symptom_match_mode = 'MIN_COUNT' THEN
            IF (SELECT count(*) FROM unnest(v_rule_symptoms) s WHERE s = ANY(p_symptom_ids)) >= v_rule.min_symptom_count THEN
                v_match := true;
            END IF;
        END IF;

        -- Dacă am găsit o potrivire, extragem datele și oprim funcția
        IF v_match = true THEN
            SELECT v_rule.is_emergency_alert, v_rule.emergency_message, t.slug, t.form_structure 
            INTO v_result
            FROM evaluation_templates t WHERE t.id = v_rule.template_id;
            
            RETURN v_result;
        END IF;

    END LOOP;

    -- 4. Dacă nicio regulă nu s-a potrivit, dăm formularul general
    SELECT false, NULL, slug, form_structure INTO v_result
    FROM evaluation_templates WHERE slug = 'evaluare-generala' LIMIT 1;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION evaluate_triage_answers(
    p_patient_id UUID,
    p_template_id UUID,
    p_answers JSONB
) 
RETURNS triage_decision_result AS $$
DECLARE
    v_scoring_logic JSONB;
    v_template_specialty medical_specialty;
    v_rule JSONB;
    v_question_id TEXT;
    v_expected_answer TEXT;
    v_top_disease_id UUID;
    v_calc_complexity_mod INT := 0;  
    v_top_disease_name TEXT;
    v_base_complexity INT;
    v_is_auto_treatable BOOLEAN;
    v_chronic_count INT;
    v_max_auto_complexity INT;
    v_result triage_decision_result;
    
    v_new_record_id UUID; 
BEGIN
    -- Extragem specialitatea din template
    SELECT scoring_logic, speciality 
    INTO v_scoring_logic, v_template_specialty 
    FROM evaluation_templates WHERE id = p_template_id;

    -- Creăm tabela temporară pentru punctaje
    CREATE TEMP TABLE temp_scores (disease_id UUID, points INT, comp_mod INT) ON COMMIT DROP;

    -- Calculăm punctajele bazate pe răspunsuri
    FOR v_rule IN SELECT * FROM jsonb_array_elements(v_scoring_logic->'rules') LOOP
        v_question_id := v_rule->>'question_id';
        v_expected_answer := v_rule->>'expected_answer';
        
        IF p_answers->>v_question_id = v_expected_answer THEN
    
            IF (v_rule->>'disease_id') IS NOT NULL 
            AND (v_rule->>'disease_id') != 'null' 
            AND (v_rule->>'disease_id') != '' THEN
                INSERT INTO temp_scores (disease_id, points, comp_mod) 
                VALUES (
                    (v_rule->>'disease_id')::UUID, 
                    (v_rule->>'points')::INT, 
                    COALESCE((v_rule->>'complexity_modifier')::INT, 0)
                );
            END IF;
        END IF;
    END LOOP;

   
    SELECT disease_id, COALESCE(SUM(comp_mod), 0) 
    INTO v_top_disease_id, v_calc_complexity_mod 
    FROM temp_scores GROUP BY disease_id ORDER BY SUM(points) DESC LIMIT 1;

   
    IF v_top_disease_id IS NULL THEN
        v_result.requires_doctor := true;
        v_result.complexity_level := 3; 
        v_result.primary_diagnosis := 'Afecțiune nespecificată (Necesită evaluare)';
        v_result.diagnosis_category := 'diagnostic provizoriu';
        v_result.message := 'Nu am putut stabili un diagnostic precis automat. Este necesară evaluarea unui medic.';

        
        INSERT INTO patient_triage_records (
            patient_id, template_id, patient_answers, 
            primary_diagnosis, complexity_level, requires_doctor, recommended_treatments,
            recommended_specialty, diagnosis_category
        ) VALUES (
            p_patient_id, p_template_id, p_answers, 
            v_result.primary_diagnosis, v_result.complexity_level, v_result.requires_doctor, NULL,
            v_template_specialty, v_result.diagnosis_category::triage_diagnosis_category
        )
        RETURNING id INTO v_new_record_id;

        v_result.record_id := v_new_record_id; 
        RETURN v_result;
    END IF;
   
   
    SELECT name, default_complexity, is_auto_treatable
    INTO v_top_disease_name, v_base_complexity, v_is_auto_treatable
    FROM diseases WHERE id = v_top_disease_id;

    -- Verificăm istoricul cronic al pacientului pentru modificarea complexității
    SELECT COUNT(disease_id) INTO v_chronic_count FROM patient_conditions 
    WHERE patient_id = p_patient_id AND disease_id IS NOT NULL;

    IF v_chronic_count > 0 THEN
        v_calc_complexity_mod := v_calc_complexity_mod + 2; 
    END IF;

    v_result.primary_diagnosis := v_top_disease_name;
    v_result.complexity_level := v_base_complexity + v_calc_complexity_mod;
    v_max_auto_complexity := COALESCE((v_scoring_logic->'thresholds'->>'auto_treatment_max_complexity')::INT, 2);

    -- Decizia finală: sistem automat vs medic specialist
    IF v_is_auto_treatable = true AND v_result.complexity_level <= v_max_auto_complexity THEN
        v_result.requires_doctor := false;
        v_result.diagnosis_category := 'diagnostic dat automat de sistem';
        v_result.message := 'Afecțiunea pare a fi una ușoară. Am generat un plan de tratament uzual de la farmacie.';
        v_result.recommended_treatments := get_treatments_for_disease(v_top_disease_id);
    ELSE
        v_result.requires_doctor := true;
        v_result.diagnosis_category := 'diagnostic provizoriu';
        v_result.recommended_treatments := NULL;
        v_result.message := 'Din cauza complexității simptomelor și a istoricului dumneavoastră, acest caz necesită evaluarea unui specialist.';
    END IF;

    -- Inserarea fișei pentru cazul în care s-a identificat o afecțiune
    INSERT INTO patient_triage_records (
        patient_id, template_id, patient_answers, 
        primary_diagnosis, complexity_level, requires_doctor, recommended_treatments,
        recommended_specialty, diagnosis_category
    ) VALUES (
        p_patient_id, p_template_id, p_answers, 
        v_result.primary_diagnosis, v_result.complexity_level, v_result.requires_doctor, v_result.recommended_treatments,
        v_template_specialty, v_result.diagnosis_category::triage_diagnosis_category
    )
    RETURNING id INTO v_new_record_id;

    v_result.record_id := v_new_record_id; 

    RETURN v_result;
END;
$$ LANGUAGE plpgsql;



DROP FUNCTION IF EXISTS get_medical_record_final(UUID);

CREATE OR REPLACE FUNCTION get_medical_record_final(p_record_id UUID)
RETURNS TABLE (
    id UUID,
    patient_name TEXT,
    patient_cnp VARCHAR,
    age INTEGER,
    gender VARCHAR,
    consultation_date TIMESTAMP WITH TIME ZONE,
    symptoms_list TEXT,
    answers JSONB,
    diagnosis TEXT,
    diagnosis_category TEXT,
    complexity INTEGER,
    doctor_needed BOOLEAN,
    recommendations TEXT,
    form_structure JSONB 
) AS $$
BEGIN
    RETURN QUERY

    -- CAZUL 1: FIȘELE MEDICULUI
    SELECT 
        c.id,
        (p.first_name || ' ' || p.last_name)::TEXT AS patient_name,
        p.cnp::VARCHAR AS patient_cnp,
        EXTRACT(YEAR FROM age(p.date_of_birth))::INTEGER AS age,
        p.gender::VARCHAR AS gender,
        c.consultation_date,
        'Simptome preluate din triaj'::TEXT AS symptoms_list, 
        tr.patient_answers AS answers,
        c.final_diagnosis AS diagnosis,
        'diagnostic confirmat de medic'::TEXT AS diagnosis_category,
        tr.complexity_level AS complexity,
        tr.requires_doctor AS doctor_needed,
        c.recommendations AS recommendations,
        et.form_structure AS form_structure -- Extragem structura formularului
    FROM consultations c
    JOIN patients p ON c.patient_id = p.id
    LEFT JOIN patient_triage_records tr ON c.triage_record_id = tr.id
    LEFT JOIN evaluation_templates et ON tr.template_id = et.id
    WHERE c.id = p_record_id

    UNION ALL

    -- CAZUL 2: FIȘELE AI TRIAJ
    SELECT 
        tr.id,
        (p.first_name || ' ' || p.last_name)::TEXT AS patient_name,
        p.cnp::VARCHAR AS patient_cnp,
        EXTRACT(YEAR FROM age(p.date_of_birth))::INTEGER AS age,
        p.gender::VARCHAR AS gender,
        tr.created_at AS consultation_date, 
        'Evaluare completată de pacient'::TEXT AS symptoms_list,
        tr.patient_answers AS answers,
        tr.primary_diagnosis AS diagnosis,
        tr.diagnosis_category::TEXT AS diagnosis_category,
        tr.complexity_level AS complexity,
        tr.requires_doctor AS doctor_needed,
        'Așteaptă evaluarea unui medic.'::TEXT AS recommendations,
        et.form_structure AS form_structure -- Extragem structura formularului
    FROM patient_triage_records tr
    JOIN patients p ON tr.patient_id = p.id
    LEFT JOIN evaluation_templates et ON tr.template_id = et.id
    WHERE tr.id = p_record_id;

END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION get_patient_medical_records(p_patient_id UUID)
RETURNS TABLE (
    id UUID,
    patient_name TEXT,
    diagnosis VARCHAR,
    diagnosis_category VARCHAR,
    complexity INTEGER,
    doctor_needed BOOLEAN,
    consultation_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tr.id::UUID,
        COALESCE(p.first_name || ' ' || p.last_name, 'Pacient Necunoscut')::TEXT,
        COALESCE(tr.primary_diagnosis, 'Fără diagnostic')::VARCHAR,
        COALESCE(tr.diagnosis_category::TEXT, 'Fără categorie')::VARCHAR,
        COALESCE(tr.complexity_level, 0)::INTEGER,
        COALESCE(tr.requires_doctor, true)::BOOLEAN,
        tr.created_at::TIMESTAMP WITH TIME ZONE
    FROM patient_triage_records tr
    JOIN patients p ON tr.patient_id = p.id
    WHERE tr.patient_id = p_patient_id 
    ORDER BY tr.created_at DESC;
END;
$$ LANGUAGE plpgsql;