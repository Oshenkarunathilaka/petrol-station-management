-- Mockup Data Seed Script for Dashboard Testing
-- Run this in your Supabase SQL Editor

DO $$
DECLARE
    v_fuel_p92 UUID;
    v_fuel_ad UUID;
    v_pump_1 UUID;
    v_pump_2 UUID;
    v_nozzle_1 UUID;
    v_nozzle_2 UUID;
    v_tank_1 UUID;
    v_tank_2 UUID;
    v_shift_1 UUID;
    v_tx_id UUID;
    v_emp_id UUID;
BEGIN
    -- Ensure fuel types exist
    INSERT INTO fuel_types (name, code, unit, status) VALUES 
    ('Petrol Octane 92', 'P92', 'Liters', 'ACTIVE') ON CONFLICT (code) DO NOTHING;
    INSERT INTO fuel_types (name, code, unit, status) VALUES 
    ('Auto Diesel', 'AD', 'Liters', 'ACTIVE') ON CONFLICT (code) DO NOTHING;

    SELECT id INTO v_fuel_p92 FROM fuel_types WHERE code = 'P92' LIMIT 1;
    SELECT id INTO v_fuel_ad FROM fuel_types WHERE code = 'AD' LIMIT 1;

    -- Create Employee
    INSERT INTO employees (employee_code, full_name, status) 
    VALUES ('EMP-001', 'Test User', 'ACTIVE') 
    ON CONFLICT (employee_code) DO UPDATE SET full_name = 'Test User' RETURNING id INTO v_emp_id;

    -- Create Tanks
    INSERT INTO tanks (tank_number, fuel_type_id, capacity_liters, minimum_stock_liters, status) 
    VALUES ('T-01', v_fuel_p92, 10000, 2000, 'ACTIVE')
    ON CONFLICT (tank_number) DO UPDATE SET status = 'ACTIVE' RETURNING id INTO v_tank_1;
    
    INSERT INTO tanks (tank_number, fuel_type_id, capacity_liters, minimum_stock_liters, status) 
    VALUES ('T-02', v_fuel_ad, 15000, 3000, 'ACTIVE')
    ON CONFLICT (tank_number) DO UPDATE SET status = 'ACTIVE' RETURNING id INTO v_tank_2;

    -- Add Tank Readings (Current Stock)
    INSERT INTO tank_readings (tank_id, reading_date, reading_time, height_cm, calculated_liters, employee_id)
    VALUES (v_tank_1, CURRENT_DATE, CURRENT_TIME, 150, 8500, v_emp_id);
    
    INSERT INTO tank_readings (tank_id, reading_date, reading_time, height_cm, calculated_liters, employee_id)
    VALUES (v_tank_2, CURRENT_DATE, CURRENT_TIME, 200, 1500, v_emp_id); -- Low stock to trigger alert

    -- Create Pumps
    INSERT INTO pumps (pump_number, status) VALUES ('P-01', 'ACTIVE') ON CONFLICT (pump_number) DO UPDATE SET status = 'ACTIVE' RETURNING id INTO v_pump_1;
    INSERT INTO pumps (pump_number, status) VALUES ('P-02', 'ACTIVE') ON CONFLICT (pump_number) DO UPDATE SET status = 'ACTIVE' RETURNING id INTO v_pump_2;

    -- Create Nozzles
    INSERT INTO pump_nozzles (pump_id, nozzle_number, fuel_type_id) VALUES (v_pump_1, 1, v_fuel_p92) ON CONFLICT DO NOTHING RETURNING id INTO v_nozzle_1;
    IF v_nozzle_1 IS NULL THEN SELECT id INTO v_nozzle_1 FROM pump_nozzles WHERE pump_id = v_pump_1 AND nozzle_number = 1; END IF;
    
    INSERT INTO pump_nozzles (pump_id, nozzle_number, fuel_type_id) VALUES (v_pump_2, 1, v_fuel_ad) ON CONFLICT DO NOTHING RETURNING id INTO v_nozzle_2;
    IF v_nozzle_2 IS NULL THEN SELECT id INTO v_nozzle_2 FROM pump_nozzles WHERE pump_id = v_pump_2 AND nozzle_number = 1; END IF;

    -- Create a Shift
    INSERT INTO shifts (name, shift_date, start_time, end_time, status) 
    VALUES ('Morning Shift', CURRENT_DATE, '06:00:00', '14:00:00', 'OPEN')
    RETURNING id INTO v_shift_1;

    -- Create Transactions (Today)
    INSERT INTO fuel_transactions (transaction_date, pump_id, employee_id, shift_id, payment_method, total_amount)
    VALUES (NOW(), v_pump_1, v_emp_id, v_shift_1, 'CASH', 5000) RETURNING id INTO v_tx_id;
    INSERT INTO transaction_items (transaction_id, nozzle_id, fuel_type_id, quantity_liters, unit_price)
    VALUES (v_tx_id, v_nozzle_1, v_fuel_p92, 12.5, 400);

    INSERT INTO fuel_transactions (transaction_date, pump_id, employee_id, shift_id, payment_method, total_amount)
    VALUES (NOW() - INTERVAL '2 hours', v_pump_2, v_emp_id, v_shift_1, 'CARD', 10000) RETURNING id INTO v_tx_id;
    INSERT INTO transaction_items (transaction_id, nozzle_id, fuel_type_id, quantity_liters, unit_price)
    VALUES (v_tx_id, v_nozzle_2, v_fuel_ad, 27.7, 360);

    INSERT INTO fuel_transactions (transaction_date, pump_id, employee_id, shift_id, payment_method, total_amount)
    VALUES (NOW() - INTERVAL '3 hours', v_pump_1, v_emp_id, v_shift_1, 'QR', 3000) RETURNING id INTO v_tx_id;
    INSERT INTO transaction_items (transaction_id, nozzle_id, fuel_type_id, quantity_liters, unit_price)
    VALUES (v_tx_id, v_nozzle_1, v_fuel_p92, 7.5, 400);

    -- Create Transactions (Yesterday) to see trends
    INSERT INTO fuel_transactions (transaction_date, pump_id, employee_id, shift_id, payment_method, total_amount)
    VALUES (NOW() - INTERVAL '1 day', v_pump_1, v_emp_id, v_shift_1, 'CASH', 4000) RETURNING id INTO v_tx_id;
    INSERT INTO transaction_items (transaction_id, nozzle_id, fuel_type_id, quantity_liters, unit_price)
    VALUES (v_tx_id, v_nozzle_1, v_fuel_p92, 10, 400);

    -- Incident (to show operational alerts)
    INSERT INTO incidents (incident_type, description, priority, incident_date, status)
    VALUES ('Pump failure', 'Pump 2 dispensing slowly', 'HIGH', NOW(), 'OPEN');
    
    -- Maintenance
    INSERT INTO maintenance (equipment_type, equipment_id, issue, reported_date, status)
    VALUES ('Pump', v_pump_1, 'Nozzle 1 filter replace', CURRENT_DATE, 'SCHEDULED');
END $$;
