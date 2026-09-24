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

CREATE POLICY "Profiles read access" ON profiles FOR SELECT USING (auth.uid() = id OR get_auth_role() IN ('ADMIN', 'MANAGER', 'SUPERVISOR'));
CREATE POLICY "Profiles insert access" ON profiles FOR INSERT WITH CHECK (auth.uid() = id OR get_auth_role() IN ('ADMIN', 'MANAGER'));
CREATE POLICY "Profiles update access" ON profiles FOR UPDATE USING (auth.uid() = id OR get_auth_role() IN ('ADMIN', 'MANAGER'));
CREATE POLICY "Profiles delete access" ON profiles FOR DELETE USING (get_auth_role() = 'ADMIN');

-- roles
CREATE POLICY "Roles read access" ON roles FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Roles write access" ON roles FOR ALL USING (get_auth_role() = 'ADMIN');

-- employees
CREATE POLICY "Employees read access" ON employees FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Employees write access" ON employees FOR ALL USING (get_auth_role() IN ('ADMIN', 'MANAGER'));

-- fuel_types
CREATE POLICY "Fuel types read access" ON fuel_types FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Fuel types write access" ON fuel_types FOR ALL USING (get_auth_role() IN ('ADMIN', 'MANAGER'));

-- fuel_prices
CREATE POLICY "Fuel prices read access" ON fuel_prices FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Fuel prices write access" ON fuel_prices FOR ALL USING (get_auth_role() IN ('ADMIN', 'MANAGER'));

-- tanks
CREATE POLICY "Tanks read access" ON tanks FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Tanks write access" ON tanks FOR ALL USING (get_auth_role() IN ('ADMIN', 'MANAGER'));

-- tank_calibrations
CREATE POLICY "Tank calibrations read access" ON tank_calibrations FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Tank calibrations write access" ON tank_calibrations FOR ALL USING (get_auth_role() IN ('ADMIN', 'MANAGER'));

-- tank_readings
CREATE POLICY "Tank readings read access" ON tank_readings FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Tank readings insert/update access" ON tank_readings FOR INSERT WITH CHECK (get_auth_role() IN ('ADMIN', 'MANAGER', 'SUPERVISOR', 'ATTENDANT'));
CREATE POLICY "Tank readings update access" ON tank_readings FOR UPDATE USING (get_auth_role() IN ('ADMIN', 'MANAGER', 'SUPERVISOR'));
CREATE POLICY "Tank readings delete access" ON tank_readings FOR DELETE USING (get_auth_role() = 'ADMIN');

-- pumps
CREATE POLICY "Pumps read access" ON pumps FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Pumps write access" ON pumps FOR ALL USING (get_auth_role() IN ('ADMIN', 'MANAGER'));

-- pump_nozzles
CREATE POLICY "Pump nozzles read access" ON pump_nozzles FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Pump nozzles write access" ON pump_nozzles FOR ALL USING (get_auth_role() IN ('ADMIN', 'MANAGER'));

-- pump_readings
CREATE POLICY "Pump readings read access" ON pump_readings FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Pump readings insert access" ON pump_readings FOR INSERT WITH CHECK (get_auth_role() IN ('ADMIN', 'MANAGER', 'SUPERVISOR', 'ATTENDANT'));
CREATE POLICY "Pump readings update access" ON pump_readings FOR UPDATE USING (get_auth_role() IN ('ADMIN', 'MANAGER', 'SUPERVISOR', 'ATTENDANT'));
CREATE POLICY "Pump readings delete access" ON pump_readings FOR DELETE USING (get_auth_role() = 'ADMIN');

-- pump_assignments
CREATE POLICY "Pump assignments read access" ON pump_assignments FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Pump assignments insert/update access" ON pump_assignments FOR INSERT WITH CHECK (get_auth_role() IN ('ADMIN', 'MANAGER', 'SUPERVISOR'));
CREATE POLICY "Pump assignments update access" ON pump_assignments FOR UPDATE USING (get_auth_role() IN ('ADMIN', 'MANAGER', 'SUPERVISOR'));
CREATE POLICY "Pump assignments delete access" ON pump_assignments FOR DELETE USING (get_auth_role() = 'ADMIN');

-- shifts
CREATE POLICY "Shifts read access" ON shifts FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Shifts insert/update access" ON shifts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Shifts update access" ON shifts FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Shifts delete access" ON shifts FOR DELETE USING (get_auth_role() IN ('ADMIN', 'MANAGER'));

-- shift_assignments
CREATE POLICY "Shift assignments read access" ON shift_assignments FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Shift assignments insert/update access" ON shift_assignments FOR INSERT WITH CHECK (get_auth_role() IN ('ADMIN', 'MANAGER', 'SUPERVISOR'));
CREATE POLICY "Shift assignments update access" ON shift_assignments FOR UPDATE USING (get_auth_role() IN ('ADMIN', 'MANAGER', 'SUPERVISOR'));
CREATE POLICY "Shift assignments delete access" ON shift_assignments FOR DELETE USING (get_auth_role() IN ('ADMIN', 'MANAGER'));

-- shift_readings
CREATE POLICY "Shift readings read access" ON shift_readings FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Shift readings insert/update access" ON shift_readings FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Shift readings update access" ON shift_readings FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Shift readings delete access" ON shift_readings FOR DELETE USING (get_auth_role() IN ('ADMIN', 'MANAGER'));

-- suppliers
CREATE POLICY "Suppliers read access" ON suppliers FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Suppliers write access" ON suppliers FOR ALL USING (get_auth_role() IN ('ADMIN', 'MANAGER'));

-- fuel_deliveries
CREATE POLICY "Fuel deliveries read access" ON fuel_deliveries FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Fuel deliveries insert/update access" ON fuel_deliveries FOR INSERT WITH CHECK (get_auth_role() IN ('ADMIN', 'MANAGER', 'SUPERVISOR'));
CREATE POLICY "Fuel deliveries update access" ON fuel_deliveries FOR UPDATE USING (get_auth_role() IN ('ADMIN', 'MANAGER', 'SUPERVISOR'));
CREATE POLICY "Fuel deliveries delete access" ON fuel_deliveries FOR DELETE USING (get_auth_role() = 'ADMIN');

-- fuel_transactions
CREATE POLICY "Fuel transactions read access" ON fuel_transactions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Fuel transactions insert/update access" ON fuel_transactions FOR INSERT WITH CHECK (get_auth_role() IN ('ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER'));
CREATE POLICY "Fuel transactions update access" ON fuel_transactions FOR UPDATE USING (get_auth_role() IN ('ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER'));
CREATE POLICY "Fuel transactions delete access" ON fuel_transactions FOR DELETE USING (get_auth_role() = 'ADMIN');

-- transaction_items
CREATE POLICY "Transaction items read access" ON transaction_items FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Transaction items insert/update access" ON transaction_items FOR INSERT WITH CHECK (get_auth_role() IN ('ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER'));
CREATE POLICY "Transaction items update access" ON transaction_items FOR UPDATE USING (get_auth_role() IN ('ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER'));
CREATE POLICY "Transaction items delete access" ON transaction_items FOR DELETE USING (get_auth_role() = 'ADMIN');

-- inventory_items
CREATE POLICY "Inventory items read access" ON inventory_items FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Inventory items write access" ON inventory_items FOR ALL USING (get_auth_role() IN ('ADMIN', 'MANAGER', 'SUPERVISOR'));

-- inventory_transactions
CREATE POLICY "Inventory transactions read access" ON inventory_transactions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Inventory transactions insert/update access" ON inventory_transactions FOR INSERT WITH CHECK (get_auth_role() IN ('ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER'));
CREATE POLICY "Inventory transactions update access" ON inventory_transactions FOR UPDATE USING (get_auth_role() IN ('ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER'));
CREATE POLICY "Inventory transactions delete access" ON inventory_transactions FOR DELETE USING (get_auth_role() = 'ADMIN');

-- expenses
CREATE POLICY "Expenses read access" ON expenses FOR SELECT USING (get_auth_role() IN ('ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER'));
CREATE POLICY "Expenses insert/update access" ON expenses FOR INSERT WITH CHECK (get_auth_role() IN ('ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER'));
CREATE POLICY "Expenses update access" ON expenses FOR UPDATE USING (get_auth_role() IN ('ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER'));
CREATE POLICY "Expenses delete access" ON expenses FOR DELETE USING (get_auth_role() = 'ADMIN');

-- maintenance
CREATE POLICY "Maintenance read access" ON maintenance FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Maintenance insert/update access" ON maintenance FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Maintenance update access" ON maintenance FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Maintenance delete access" ON maintenance FOR DELETE USING (get_auth_role() = 'ADMIN');

-- incidents
CREATE POLICY "Incidents read access" ON incidents FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Incidents insert/update access" ON incidents FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Incidents update access" ON incidents FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Incidents delete access" ON incidents FOR DELETE USING (get_auth_role() = 'ADMIN');

-- stock_reconciliations
CREATE POLICY "Stock reconciliations read access" ON stock_reconciliations FOR SELECT USING (get_auth_role() IN ('ADMIN', 'MANAGER', 'SUPERVISOR'));
CREATE POLICY "Stock reconciliations insert/update access" ON stock_reconciliations FOR INSERT WITH CHECK (get_auth_role() IN ('ADMIN', 'MANAGER'));
CREATE POLICY "Stock reconciliations update access" ON stock_reconciliations FOR UPDATE USING (get_auth_role() IN ('ADMIN', 'MANAGER'));
CREATE POLICY "Stock reconciliations delete access" ON stock_reconciliations FOR DELETE USING (get_auth_role() = 'ADMIN');

-- audit_logs
CREATE POLICY "Audit logs read access" ON audit_logs FOR SELECT USING (get_auth_role() IN ('ADMIN', 'MANAGER'));
CREATE POLICY "Audit logs insert access" ON audit_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
-- No UPDATE or DELETE policies intentionally.

-- report_exports
CREATE POLICY "Report exports read access" ON report_exports FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Report exports insert/update access" ON report_exports FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Report exports update access" ON report_exports FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Report exports delete access" ON report_exports FOR DELETE USING (get_auth_role() = 'ADMIN');
