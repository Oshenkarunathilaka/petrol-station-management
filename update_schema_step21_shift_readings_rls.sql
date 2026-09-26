-- =============================================================================
-- Step 21: Fix missing RLS INSERT policy on shift_readings (Daily Entry)
--
-- Symptom:
--   "new row violates row-level security policy for table \"shift_readings\""
--   when saving a Daily Entry (src/app/dashboard/daily-entry/actions.ts).
--
-- Cause:
--   RLS is enabled on shift_readings (by the DO $$ loop in step20_rls.sql,
--   which runs FIRST), but its INSERT policy never actually landed in the
--   database. step20_rls.sql uses bare CREATE POLICY with no DROP POLICY IF
--   EXISTS beforehand, so re-running it aborts on the first duplicate policy
--   name and silently leaves the remaining tables with RLS enabled but no
--   policy -> every INSERT is rejected.
--
--   Note the Daily Entry insert into pump_readings (the step immediately
--   before this one) succeeds, which proves the session IS being forwarded and
--   auth.uid() IS NOT NULL. The problem is a missing policy, not auth.
--
-- This script is fully idempotent: safe to run as many times as needed.
-- Run it in the Supabase SQL Editor.
-- =============================================================================

-- 1. Helper function (idempotent). Must exist for the role checks below.
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

-- 2. Make sure RLS is actually on for the tables touched by Daily Entry.
ALTER TABLE shift_readings ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 3. shift_readings policies
--    Roles match ROUTE_PERMISSIONS['/dashboard/daily-entry'] in
--    src/config/permissions.ts (ADMIN, MANAGER, SUPERVISOR, CASHIER, ATTENDANT).
-- =============================================================================
DROP POLICY IF EXISTS "Shift readings read access" ON shift_readings;
DROP POLICY IF EXISTS "Shift readings insert/update access" ON shift_readings;
DROP POLICY IF EXISTS "Shift readings update access" ON shift_readings;
DROP POLICY IF EXISTS "Shift readings delete access" ON shift_readings;

CREATE POLICY "Shift readings read access" ON shift_readings
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- THE FIX: this INSERT policy was the missing one.
CREATE POLICY "Shift readings insert/update access" ON shift_readings
  FOR INSERT WITH CHECK (
    get_auth_role() IN ('ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER', 'ATTENDANT')
  );

CREATE POLICY "Shift readings update access" ON shift_readings
  FOR UPDATE USING (
    get_auth_role() IN ('ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER', 'ATTENDANT')
  );

CREATE POLICY "Shift readings delete access" ON shift_readings
  FOR DELETE USING (get_auth_role() IN ('ADMIN', 'MANAGER'));

-- =============================================================================
-- 4. Latent bug: pump_readings INSERT excluded CASHIER, so a CASHIER (who is
--    explicitly allowed on /dashboard/daily-entry) would fail on the step
--    BEFORE shift_readings with the exact same RLS error. Align it with the
--    other transaction tables (fuel_transactions, transaction_items), which
--    all include CASHIER.
-- =============================================================================
DROP POLICY IF EXISTS "Pump readings insert access" ON pump_readings;
CREATE POLICY "Pump readings insert access" ON pump_readings
  FOR INSERT WITH CHECK (
    get_auth_role() IN ('ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER', 'ATTENDANT')
  );

-- Required by the compensating rollback in daily-entry/actions.ts: if a later
-- step fails, the action deletes the meter reading it just inserted. Previously
-- DELETE was ADMIN-only, so that rollback silently no-opped for every other
-- role and the failed entry left a duplicate meter reading behind.
DROP POLICY IF EXISTS "Pump readings delete access" ON pump_readings;
CREATE POLICY "Pump readings delete access" ON pump_readings
  FOR DELETE USING (
    get_auth_role() IN ('ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER', 'ATTENDANT')
  );

-- =============================================================================
-- 5. VERIFICATION - returns the policies now on shift_readings.
--    You should see 4 rows, including an INSERT policy.
-- =============================================================================
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'shift_readings'
ORDER BY cmd;

-- =============================================================================
-- 6. OPTIONAL CLEANUP
--    The Daily Entry that produced this error committed its pump_readings row
--    BEFORE the shift_readings insert failed, leaving an orphaned meter reading
--    (a reading with no matching cash collection). `pump_readings` has no unique
--    constraint, so simply retrying the entry would add a SECOND row for the
--    same nozzle and corrupt the sales figures.
--
--    First, INSPECT (safe, read-only) - run this and eyeball the result:
-- =============================================================================
-- SELECT pr.id, pr.nozzle_id, pr.reading_date, pr.reading_time,
--        pr.previous_meter, pr.current_meter, pr.fuel_sold_liters,
--        sr.id AS matching_shift_reading
-- FROM pump_readings pr
-- LEFT JOIN shift_readings sr
--   ON sr.shift_id = pr.shift_id
--  AND sr.pump_id  = (SELECT p.id FROM pumps p WHERE p.id = pr.nozzle_id)
--  AND sr.opening_reading = pr.previous_meter
--  AND sr.closing_reading = pr.current_meter
-- WHERE sr.id IS NULL
-- ORDER BY pr.created_at DESC;
--
-- Only after you have confirmed the rows above are genuinely the failed
-- attempts, delete them (replace <nozzle_id> with the value you verified):
-- =============================================================================
-- DELETE FROM pump_readings
-- WHERE nozzle_id = '<nozzle_id>'
--   AND current_meter = <closing_meter>
--   AND NOT EXISTS (
--     SELECT 1 FROM shift_readings sr
--     WHERE sr.shift_id = pump_readings.shift_id
--       AND sr.opening_reading = pump_readings.previous_meter
--       AND sr.closing_reading = pump_readings.current_meter
--   );
