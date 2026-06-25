CREATE OR REPLACE FUNCTION save_patient_conditions(
    p_patient_id UUID, 
    p_disease_ids UUID[]
)
RETURNS void AS $$
BEGIN
    --stergem toate bolile existente pentru pacient (dacă există) - vom reintroduce doar cele selectate
    DELETE FROM patient_conditions WHERE patient_id = p_patient_id;
    
   
    IF p_disease_ids IS NOT NULL AND array_length(p_disease_ids, 1) > 0 THEN
        INSERT INTO patient_conditions (patient_id, disease_id)
        SELECT p_patient_id, unnest(p_disease_ids);
    END IF;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION get_patient_conditions(p_patient_id UUID)
RETURNS TABLE (
    disease_id UUID, 
    condition_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT d.id, d.name::TEXT FROM patient_conditions pc INNER JOIN diseases d ON pc.disease_id = d.id
    WHERE pc.patient_id = p_patient_id ORDER BY d.name;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION get_disease_catalog()
RETURNS TABLE (
    disease_id UUID, 
    disease_name TEXT, 
    category_name TEXT
) AS $$ 
BEGIN
    RETURN QUERY
    SELECT id, name::TEXT, category::TEXT FROM diseases ORDER BY category, name;
END;
$$ LANGUAGE plpgsql;