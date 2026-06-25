
--functie durata consultatie in functie de complexitate
CREATE OR REPLACE FUNCTION calculate_appointment_duration(p_complexity INT)
RETURNS INTEGER AS $$
BEGIN
    IF p_complexity <= 2 THEN RETURN 10;
    ELSIF p_complexity <= 4 THEN RETURN 20;
    ELSE RETURN 30;
    END IF;
END;
$$ LANGUAGE plpgsql STABLE;

--------------------------------------------------------------------------------------------------

--disponibilitatea medicului pentru un interval dat
CREATE OR REPLACE FUNCTION is_doctor_available(
    p_doctor_id UUID,
    p_start_ts TIMESTAMP WITH TIME ZONE,
    p_end_ts TIMESTAMP WITH TIME ZONE
)
RETURNS BOOLEAN AS $$
DECLARE
    v_conflict_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM appointments 
        WHERE doctor_id = p_doctor_id 
        AND status = 'PROGRAMAT'
        AND (start_time < p_end_ts AND end_time > p_start_ts)
    ) INTO v_conflict_exists;
    
    RETURN NOT v_conflict_exists; -- E disponibil dacă NU există conflict
END;
$$ LANGUAGE plpgsql STABLE;


----------------------------------------------------------------------------------------------------


--functie de programare a pacientului la un doctor disponibil, pe baza specialității recomandate și a complexității

CREATE OR REPLACE FUNCTION schedule_patient_appointment(
    p_patient_id UUID,
    p_triage_id UUID,
    p_specialty medical_specialty,
    p_duration_mins INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    v_date DATE := CURRENT_DATE;
    v_check_time TIME;
    v_start_ts TIMESTAMP WITH TIME ZONE;
    v_end_ts TIMESTAMP WITH TIME ZONE;
    v_shift RECORD;
    v_doctor RECORD;
    v_days_to_look INTEGER := 14; 
BEGIN
    FOR i IN 0..v_days_to_look LOOP
        
        FOR v_doctor IN (
            SELECT d.id, 
                   (SELECT COUNT(*) FROM appointments a WHERE a.doctor_id = d.id AND a.status = 'PROGRAMAT') as active_load
            FROM doctors d WHERE d.specialty = p_specialty ORDER BY active_load ASC
        ) LOOP
            -- Căutăm în turele doctorului
            FOR v_shift IN SELECT * FROM doctor_shifts 
                           WHERE doctor_id = v_doctor.id AND day_of_week = EXTRACT(ISODOW FROM (v_date + i)) LOOP
                
                v_check_time := v_shift.start_time;
                
                -- Căutăm din 10 în 10 minute
                WHILE v_check_time + (p_duration_mins || ' minutes')::interval <= v_shift.end_time LOOP
                    v_start_ts := (v_date + i) + v_check_time;
                    v_end_ts := v_start_ts + (p_duration_mins || ' minutes')::interval;

                    IF v_start_ts > CURRENT_TIMESTAMP THEN
                        
                        IF is_doctor_available(v_doctor.id, v_start_ts, v_end_ts) THEN
                            
                            -- Inserăm programarea
                            INSERT INTO appointments (patient_id, doctor_id, triage_record_id, start_time, end_time, duration_minutes)
                            VALUES (p_patient_id, v_doctor.id, p_triage_id, v_start_ts, v_end_ts, p_duration_mins);
                            
                            RETURN TRUE; -- Programare reușită
                        END IF;
                    END IF;
                    
                    v_check_time := v_check_time + '10 minutes'::interval;
                END LOOP;
            END LOOP;
        END LOOP;
    END LOOP;
    
    RETURN FALSE; 
END;
$$ LANGUAGE plpgsql;


---------------------------------------------------------------------------------------------------


--trigger pt programare

CREATE OR REPLACE FUNCTION trg_auto_schedule_after_triage()
RETURNS TRIGGER AS $$
DECLARE
    v_duration_mins INTEGER;
    v_is_scheduled BOOLEAN;
BEGIN
    --daca nu necesita doctor sau nu are specialitate recomandata, nu incercam programarea
    IF NEW.requires_doctor = false OR NEW.recommended_specialty IS NULL THEN
        RETURN NEW;
    END IF;

    
    v_duration_mins := calculate_appointment_duration(NEW.complexity_level);

    
    v_is_scheduled := schedule_patient_appointment(
        NEW.patient_id,
        NEW.id,
        NEW.recommended_specialty,
        v_duration_mins
    );

   
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS trigger_auto_schedule ON patient_triage_records;

CREATE TRIGGER trigger_auto_schedule
AFTER INSERT ON patient_triage_records
FOR EACH ROW
EXECUTE FUNCTION trg_auto_schedule_after_triage();

CREATE OR REPLACE FUNCTION get_doctor_appointments(p_doctor_id UUID)
RETURNS TABLE (
    id UUID,
    patient_name TEXT,
    primary_diagnosis TEXT,
    patient_answers JSONB,
    complexity_level INTEGER,
    start_time TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        (p.first_name || ' ' || p.last_name)::TEXT AS patient_name,
        tr.primary_diagnosis::TEXT,
        tr.patient_answers,
        tr.complexity_level::INTEGER,
        a.start_time
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    JOIN patient_triage_records tr ON a.triage_record_id = tr.id
    WHERE a.doctor_id = p_doctor_id 
      AND a.status = 'PROGRAMAT'
    ORDER BY a.start_time ASC;
END;
$$ LANGUAGE plpgsql;

DROP FUNCTION IF EXISTS get_patient_appointments_history(UUID);

CREATE OR REPLACE FUNCTION get_patient_appointments_history(p_patient_id UUID)
RETURNS TABLE (
    id UUID,
    doctor_name TEXT,
    specialty TEXT,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50),
    primary_diagnosis TEXT,
    patient_name TEXT 
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        (d.first_name || ' ' || d.last_name)::TEXT AS doctor_name,
        d.specialty::TEXT,
        a.start_time,
        a.end_time,
        a.status,
        tr.primary_diagnosis::TEXT,
        (p.first_name || ' ' || p.last_name)::TEXT AS patient_name 
    FROM appointments a
    JOIN doctors d ON a.doctor_id = d.id
    JOIN patients p ON a.patient_id = p.id 
    LEFT JOIN patient_triage_records tr ON a.triage_record_id = tr.id
    WHERE (a.patient_id = p_patient_id OR p.parent_id = p_patient_id) 
    ORDER BY a.start_time DESC; 
END;
$$ LANGUAGE plpgsql;