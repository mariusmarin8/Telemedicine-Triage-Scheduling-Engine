--modificare tabela patients pentru a adăuga tipul de abonament și data expirării
ALTER TABLE patients DROP CONSTRAINT IF EXISTS patients_subscription_type_check;

ALTER TABLE patients 
    ALTER COLUMN subscription_type SET DEFAULT 'Niciunul',
    ADD CONSTRAINT patients_subscription_type_check 
        CHECK (subscription_type IN ('Niciunul', 'Individual', 'Family'));


-- Adăugare coloane pentru abonament
CREATE TABLE subscription_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    plan_type VARCHAR(20) NOT NULL CHECK (plan_type IN ('Individual', 'Family')),
    billing_cycle VARCHAR(20) NOT NULL CHECK (billing_cycle IN ('Lunar', 'Anual')),
    
    amount_paid DECIMAL(10, 2) NOT NULL,
    payment_date TIMESTAMPTZ DEFAULT NOW(),
    valid_until DATE NOT NULL 
);



--trigger pentru a actualiza automat profilul pacientului după o plată
CREATE OR REPLACE FUNCTION trg_update_patient_subscription()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE patients
    SET 
        subscription_type = NEW.plan_type,
        subscription_expires_at = NEW.valid_until,
        updated_at = NOW()
    WHERE id = NEW.patient_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_after_payment ON subscription_payments;

CREATE TRIGGER trigger_after_payment
AFTER INSERT ON subscription_payments
FOR EACH ROW
EXECUTE FUNCTION trg_update_patient_subscription();


CREATE OR REPLACE FUNCTION purchase_subscription(
    p_patient_id UUID,
    p_plan_type VARCHAR,
    p_billing_cycle VARCHAR
)
RETURNS BOOLEAN AS $$
DECLARE
    v_amount DECIMAL(10, 2);
    v_valid_until DATE;
BEGIN
    IF p_plan_type NOT IN ('Individual', 'Family') OR p_billing_cycle NOT IN ('Lunar', 'Anual') THEN
        RAISE EXCEPTION 'Date de abonament invalide.';
    END IF;

    IF p_plan_type = 'Individual' AND p_billing_cycle = 'Lunar' THEN
        v_amount := 50.00;
    ELSIF p_plan_type = 'Individual' AND p_billing_cycle = 'Anual' THEN
        v_amount := 500.00;
    ELSIF p_plan_type = 'Family' AND p_billing_cycle = 'Lunar' THEN
        v_amount := 150.00;
    ELSIF p_plan_type = 'Family' AND p_billing_cycle = 'Anual' THEN
        v_amount := 1500.00;
    END IF;

    
    IF p_billing_cycle = 'Lunar' THEN
        v_valid_until := CURRENT_DATE + INTERVAL '1 month';
    ELSE
        v_valid_until := CURRENT_DATE + INTERVAL '1 year';
    END IF;

    --aici trigger ul se activează și actualizează automat tabela patients
    INSERT INTO subscription_payments (
        patient_id, plan_type, billing_cycle, amount_paid, valid_until
    ) VALUES (
        p_patient_id, p_plan_type, p_billing_cycle, v_amount, v_valid_until
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;


--functie verificare abonament activ
CREATE OR REPLACE FUNCTION has_telemedicine_access(p_patient_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_has_access BOOLEAN;
BEGIN
    SELECT 
        CASE 
           --paccient adult, verificăm direct în tabela patients
            WHEN p.parent_id IS NULL THEN
                (p.subscription_type IN ('Individual', 'Family') AND p.subscription_expires_at >= CURRENT_DATE)
                
            --pacient minor, verificăm abonamentul părintelui
            ELSE
                (parent.subscription_type = 'Family' AND parent.subscription_expires_at >= CURRENT_DATE)
        END INTO v_has_access
    FROM patients p
    LEFT JOIN patients parent ON p.parent_id = parent.id
    WHERE p.id = p_patient_id;

    
    RETURN COALESCE(v_has_access, FALSE);
END;
$$ LANGUAGE plpgsql;