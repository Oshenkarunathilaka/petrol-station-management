-- Step 20: Row Level Security and Authorization Validation

-- 1. Helper function to securely get the current user's role
CREATE OR REPLACE FUNCTION get_auth_role() RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT r.name INTO user_role
  FROM profiles p
  JOIN roles r ON p.role_id = r.id
  WHERE p.id = auth.uid();
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Drop existing policies to prevent conflicts
DO $$ 
DECLARE 
  r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
    EXECUTE 'ALTER TABLE ' || quote_ident(r.tablename) || ' ENABLE ROW LEVEL SECURITY;';
  END LOOP;
END $$;

-- profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can view roles" ON roles;

DROP POLICY IF EXISTS "Profiles read access" ON profiles;
CREATE POLICY "Profiles read access" ON profiles FOR SELECT USING (auth.uid() = id OR get_auth_role() IN ('ADMIN', 'MANAGER', 'SUPERVISOR'));
DROP POLICY IF EXISTS "Profiles insert access" ON profiles;
CREATE POLICY "Profiles insert access" ON profiles FOR INSERT WITH CHECK (auth.uid() = id OR get_auth_role() IN ('ADMIN', 'MANAGER'));
DROP POLICY IF EXISTS "Profiles update access" ON profiles;
CREATE POLICY "Profiles update access" ON profiles FOR UPDATE USING (auth.uid() = id OR get_auth_role() IN ('ADMIN', 'MANAGER'));
DROP POLICY IF EXISTS "Profiles delete access" ON profiles;
CREATE POLICY "Profiles delete access" ON profiles FOR DELETE USING (get_auth_role() = 'ADMIN');

-- roles
DROP POLICY IF EXISTS "Roles read access" ON roles;
CREATE POLICY "Roles read access" ON roles FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Roles write access" ON roles;
CREATE POLICY "Roles write access" ON roles FOR ALL USING (get_auth_role() = 'ADMIN');

-- employees
DROP POLICY IF EXISTS "Employees read access" ON employees;
CREATE POLICY "Employees read access" ON employees FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Employees write access" ON employees;
CREATE POLICY "Employees write access" ON employees FOR ALL USING (get_auth_role() IN ('ADMIN', 'MANAGER'));

-- fuel_types
DROP POLICY IF EXISTS "Fuel types read access" ON fuel_types;
CREATE POLICY "Fuel types read access" ON fuel_types FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Fuel types write access" ON fuel_types;
CREATE POLICY "Fuel types write access" ON fuel_types FOR ALL USING (get_auth_role() IN ('ADMIN', 'MANAGER'));

-- fuel_prices
DROP POLICY IF EXISTS "Fuel prices read access" ON fuel_prices;
CREATE POLICY "Fuel prices read access" ON fuel_prices FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Fuel prices write access" ON fuel_prices;
CREATE POLICY "Fuel prices write access" ON fuel_prices FOR ALL USING (get_auth_role() IN ('ADMIN', 'MANAGER'));

-- tanks
DROP POLICY IF EXISTS "Tanks read access" ON tanks;
CREATE POLICY "Tanks read access" ON tanks FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Tanks write access" ON tanks;
CREATE POLICY "Tanks write access" ON tanks FOR ALL USING (get_auth_role() IN ('ADMIN', 'MANAGER'));

-- tank_calibrations
DROP POLICY IF EXISTS "Tank calibrations read access" ON tank_calibrations;
CREATE POLICY "Tank calibrations read access" ON tank_calibrations FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Tank calibrations write access" ON tank_calibrations;
CREATE POLICY "Tank calibrations write access" ON tank_calibrations FOR ALL USING (get_auth_role() IN ('ADMIN', 'MANAGER'));

-- tank_readings
DROP POLICY IF EXISTS "Tank readings read access" ON tank_readings;
CREATE POLICY "Tank readings read access" ON tank_readings FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Tank readings insert/update access" ON tank_readings;
CREATE POLICY "Tank readings insert/update access" ON tank_readings FOR INSERT WITH CHECK (get_auth_role() IN ('ADMIN', 'MANAGER', 'SUPERVISOR', 'ATTENDANT'));
DROP POLICY IF EXISTS "Tank readings update access" ON tank_readings;
CREATE POLICY "Tank readings update access" ON tank_readings FOR UPDATE USING (get_auth_role() IN ('ADMIN', 'MANAGER', 'SUPERVISOR'));
DROP POLICY IF EXISTS "Tank readings delete access" ON tank_readings;
CREATE POLICY "Tank readings delete access" ON tank_readings FOR DELETE USING (get_auth_role() = 'ADMIN');

-- pumps
DROP POLICY IF EXISTS "Pumps read access" ON pumps;
CREATE POLICY "Pumps read access" ON pumps FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Pumps write access" ON pumps;
CREATE POLICY "Pumps write access" ON pumps FOR ALL USING (get_auth_role() IN ('ADMIN', 'MANAGER'));

-- pump_nozzles
DROP POLICY IF EXISTS "Pump nozzles read access" ON pump_nozzles;
CREATE POLICY "Pump nozzles read access" ON pump_nozzles FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Pump nozzles write access" ON pump_nozzles;
CREATE POLICY "Pump nozzles write access" ON pump_nozzles FOR ALL USING (get_auth_role() IN ('ADMIN', 'MANAGER'));

-- pump_readings
DROP POLICY IF EXISTS "Pump readings read access" ON pump_readings;
CREATE POLICY "Pump readings read access" ON pump_readings FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Pump readings insert access" ON pump_readings;
CREATE POLICY "Pump readings insert access" ON pump_readings FOR INSERT WITH CHECK (get_auth_role() IN ('ADMIN', 'MANAGER', 'SUPERVISOR', 'ATTENDANT'));
DROP POLICY IF EXISTS "Pump readings update access" ON pump_readings;
CREATE POLICY "Pump readings update access" ON pump_readings FOR UPDATE USING (get_auth_role() IN ('ADMIN', 'MANAGER', 'SUPERVISOR', 'ATTENDANT'));
DROP POLICY IF EXISTS "Pump readings delete access" ON pump_readings;
CREATE POLICY "Pump readings delete access" ON pump_readings FOR DELETE USING (get_auth_role() = 'ADMIN');

-- pump_assignments
DROP POLICY IF EXISTS "Pump assignments read access" ON pump_assignments;
CREATE POLICY "Pump assignments read access" ON pump_assignments FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Pump assignments insert/update access" ON pump_assignments;
CREATE POLICY "Pump assignments insert/update access" ON pump_assignments FOR INSERT WITH CHECK (get_auth_role() IN ('ADMIN', 'MANAGER', 'SUPERVISOR'));
DROP POLICY IF EXISTS "Pump assignments update access" ON pump_assignments;
CREATE POLICY "Pump assignments update access" ON pump_assignments FOR UPDATE USING (get_auth_role() IN ('ADMIN', 'MANAGER', 'SUPERVISOR'));
DROP POLICY IF EXISTS "Pump assignments delete access" ON pump_assignments;
CREATE POLICY "Pump assignments delete access" ON pump_assignments FOR DELETE USING (get_auth_role() = 'ADMIN');

-- shifts
DROP POLICY IF EXISTS "Shifts read access" ON shifts;
CREATE POLICY "Shifts read access" ON shifts FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Shifts insert/update access" ON shifts;
CREATE POLICY "Shifts insert/update access" ON shifts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Shifts update access" ON shifts;
CREATE POLICY "Shifts update access" ON shifts FOR UPDATE USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Shifts delete access" ON shifts;
CREATE POLICY "Shifts delete access" ON shifts FOR DELETE USING (get_auth_role() IN ('ADMIN', 'MANAGER'));

-- shift_assignments
DROP POLICY IF EXISTS "Shift assignments read access" ON shift_assignments;
CREATE POLICY "Shift assignments read access" ON shift_assignments FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Shift assignments insert/update access" ON shift_assignments;
CREATE POLICY "Shift assignments insert/update access" ON shift_assignments FOR INSERT WITH CHECK (get_auth_role() IN ('ADMIN', 'MANAGER', 'SUPERVISOR'));
DROP POLICY IF EXISTS "Shift assignments update access" ON shift_assignments;
CREATE POLICY "Shift assignments update access" ON shift_assignments FOR UPDATE USING (get_auth_role() IN ('ADMIN', 'MANAGER', 'SUPERVISOR'));
DROP POLICY IF EXISTS "Shift assignments delete access" ON shift_assignments;
CREATE POLICY "Shift assignments delete access" ON shift_assignments FOR DELETE USING (get_auth_role() IN ('ADMIN', 'MANAGER'));

-- shift_readings
DROP POLICY IF EXISTS "Shift readings read access" ON shift_readings;
CREATE POLICY "Shift readings read access" ON shift_readings FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Shift readings insert/update access" ON shift_readings;
CREATE POLICY "Shift readings insert/update access" ON shift_readings FOR INSERT WITH CHECK (get_auth_role() IN ('ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER', 'ATTENDANT'));
DROP POLICY IF EXISTS "Shift readings update access" ON shift_readings;
CREATE POLICY "Shift readings update access" ON shift_readings FOR UPDATE USING (get_auth_role() IN ('ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER', 'ATTENDANT'));
DROP POLICY IF EXISTS "Shift readings delete access" ON shift_readings;
CREATE POLICY "Shift readings delete access" ON shift_readings FOR DELETE USING (get_auth_role() IN ('ADMIN', 'MANAGER'));

-- suppliers
DROP POLICY IF EXISTS "Suppliers read access" ON suppliers;
CREATE POLICY "Suppliers read access" ON suppliers FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Suppliers write access" ON suppliers;
CREATE POLICY "Suppliers write access" ON suppliers FOR ALL USING (get_auth_role() IN ('ADMIN', 'MANAGER'));

-- fuel_deliveries
DROP POLICY IF EXISTS "Fuel deliveries read access" ON fuel_deliveries;
CREATE POLICY "Fuel deliveries read access" ON fuel_deliveries FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Fuel deliveries insert/update access" ON fuel_deliveries;
CREATE POLICY "Fuel deliveries insert/update access" ON fuel_deliveries FOR INSERT WITH CHECK (get_auth_role() IN ('ADMIN', 'MANAGER', 'SUPERVISOR'));
DROP POLICY IF EXISTS "Fuel deliveries update access" ON fuel_deliveries;
CREATE POLICY "Fuel deliveries update access" ON fuel_deliveries FOR UPDATE USING (get_auth_role() IN ('ADMIN', 'MANAGER', 'SUPERVISOR'));
DROP POLICY IF EXISTS "Fuel deliveries delete access" ON fuel_deliveries;
CREATE POLICY "Fuel deliveries delete access" ON fuel_deliveries FOR DELETE USING (get_auth_role() = 'ADMIN');

-- fuel_transactions
DROP POLICY IF EXISTS "Fuel transactions read access" ON fuel_transactions;
CREATE POLICY "Fuel transactions read access" ON fuel_transactions FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Fuel transactions insert/update access" ON fuel_transactions;
CREATE POLICY "Fuel transactions insert/update access" ON fuel_transactions FOR INSERT WITH CHECK (get_auth_role() IN ('ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER'));
DROP POLICY IF EXISTS "Fuel transactions update access" ON fuel_transactions;
CREATE POLICY "Fuel transactions update access" ON fuel_transactions FOR UPDATE USING (get_auth_role() IN ('ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER'));
DROP POLICY IF EXISTS "Fuel transactions delete access" ON fuel_transactions;
CREATE POLICY "Fuel transactions delete access" ON fuel_transactions FOR DELETE USING (get_auth_role() = 'ADMIN');

-- transaction_items
DROP POLICY IF EXISTS "Transaction items read access" ON transaction_items;
CREATE POLICY "Transaction items read access" ON transaction_items FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Transaction items insert/update access" ON transaction_items;
CREATE POLICY "Transaction items insert/update access" ON transaction_items FOR INSERT WITH CHECK (get_auth_role() IN ('ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER'));
DROP POLICY IF EXISTS "Transaction items update access" ON transaction_items;
CREATE POLICY "Transaction items update access" ON transaction_items FOR UPDATE USING (get_auth_role() IN ('ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER'));
DROP POLICY IF EXISTS "Transaction items delete access" ON transaction_items;
CREATE POLICY "Transaction items delete access" ON transaction_items FOR DELETE USING (get_auth_role() = 'ADMIN');

-- inventory_items
DROP POLICY IF EXISTS "Inventory items read access" ON inventory_items;
CREATE POLICY "Inventory items read access" ON inventory_items FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Inventory items write access" ON inventory_items;
CREATE POLICY "Inventory items write access" ON inventory_items FOR ALL USING (get_auth_role() IN ('ADMIN', 'MANAGER', 'SUPERVISOR'));

-- inventory_transactions
DROP POLICY IF EXISTS "Inventory transactions read access" ON inventory_transactions;
CREATE POLICY "Inventory transactions read access" ON inventory_transactions FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Inventory transactions insert/update access" ON inventory_transactions;
CREATE POLICY "Inventory transactions insert/update access" ON inventory_transactions FOR INSERT WITH CHECK (get_auth_role() IN ('ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER'));
DROP POLICY IF EXISTS "Inventory transactions update access" ON inventory_transactions;
CREATE POLICY "Inventory transactions update access" ON inventory_transactions FOR UPDATE USING (get_auth_role() IN ('ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER'));
DROP POLICY IF EXISTS "Inventory transactions delete access" ON inventory_transactions;
CREATE POLICY "Inventory transactions delete access" ON inventory_transactions FOR DELETE USING (get_auth_role() = 'ADMIN');

-- expenses
DROP POLICY IF EXISTS "Expenses read access" ON expenses;
CREATE POLICY "Expenses read access" ON expenses FOR SELECT USING (get_auth_role() IN ('ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER'));
DROP POLICY IF EXISTS "Expenses insert/update access" ON expenses;
CREATE POLICY "Expenses insert/update access" ON expenses FOR INSERT WITH CHECK (get_auth_role() IN ('ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER'));
DROP POLICY IF EXISTS "Expenses update access" ON expenses;
CREATE POLICY "Expenses update access" ON expenses FOR UPDATE USING (get_auth_role() IN ('ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER'));
DROP POLICY IF EXISTS "Expenses delete access" ON expenses;
CREATE POLICY "Expenses delete access" ON expenses FOR DELETE USING (get_auth_role() = 'ADMIN');

-- maintenance
DROP POLICY IF EXISTS "Maintenance read access" ON maintenance;
CREATE POLICY "Maintenance read access" ON maintenance FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Maintenance insert/update access" ON maintenance;
CREATE POLICY "Maintenance insert/update access" ON maintenance FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Maintenance update access" ON maintenance;
CREATE POLICY "Maintenance update access" ON maintenance FOR UPDATE USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Maintenance delete access" ON maintenance;
CREATE POLICY "Maintenance delete access" ON maintenance FOR DELETE USING (get_auth_role() = 'ADMIN');

-- incidents
DROP POLICY IF EXISTS "Incidents read access" ON incidents;
CREATE POLICY "Incidents read access" ON incidents FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Incidents insert/update access" ON incidents;
CREATE POLICY "Incidents insert/update access" ON incidents FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Incidents update access" ON incidents;
CREATE POLICY "Incidents update access" ON incidents FOR UPDATE USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Incidents delete access" ON incidents;
CREATE POLICY "Incidents delete access" ON incidents FOR DELETE USING (get_auth_role() = 'ADMIN');

-- stock_reconciliations
DROP POLICY IF EXISTS "Stock reconciliations read access" ON stock_reconciliations;
CREATE POLICY "Stock reconciliations read access" ON stock_reconciliations FOR SELECT USING (get_auth_role() IN ('ADMIN', 'MANAGER', 'SUPERVISOR'));
DROP POLICY IF EXISTS "Stock reconciliations insert/update access" ON stock_reconciliations;
CREATE POLICY "Stock reconciliations insert/update access" ON stock_reconciliations FOR INSERT WITH CHECK (get_auth_role() IN ('ADMIN', 'MANAGER'));
DROP POLICY IF EXISTS "Stock reconciliations update access" ON stock_reconciliations;
CREATE POLICY "Stock reconciliations update access" ON stock_reconciliations FOR UPDATE USING (get_auth_role() IN ('ADMIN', 'MANAGER'));
DROP POLICY IF EXISTS "Stock reconciliations delete access" ON stock_reconciliations;
CREATE POLICY "Stock reconciliations delete access" ON stock_reconciliations FOR DELETE USING (get_auth_role() = 'ADMIN');

-- audit_logs
DROP POLICY IF EXISTS "Audit logs read access" ON audit_logs;
CREATE POLICY "Audit logs read access" ON audit_logs FOR SELECT USING (get_auth_role() IN ('ADMIN', 'MANAGER'));
DROP POLICY IF EXISTS "Audit logs insert access" ON audit_logs;
CREATE POLICY "Audit logs insert access" ON audit_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
-- No UPDATE or DELETE policies intentionally.

-- report_exports
DROP POLICY IF EXISTS "Report exports read access" ON report_exports;
CREATE POLICY "Report exports read access" ON report_exports FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Report exports insert/update access" ON report_exports;
CREATE POLICY "Report exports insert/update access" ON report_exports FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Report exports update access" ON report_exports;
CREATE POLICY "Report exports update access" ON report_exports FOR UPDATE USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Report exports delete access" ON report_exports;
CREATE POLICY "Report exports delete access" ON report_exports FOR DELETE USING (get_auth_role() = 'ADMIN');
