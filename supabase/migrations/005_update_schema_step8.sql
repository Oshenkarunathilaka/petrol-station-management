-- Add missing columns for Step 8
ALTER TABLE pumps ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE pump_readings ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE pump_assignments ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED'));

-- Enable RLS
ALTER TABLE pumps ENABLE ROW LEVEL SECURITY;
ALTER TABLE pump_nozzles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pump_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pump_assignments ENABLE ROW LEVEL SECURITY;

-- Pumps RLS
DROP POLICY IF EXISTS "Anyone can view pumps" ON pumps;
CREATE POLICY "Anyone can view pumps" ON pumps FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin/Manager can insert pumps" ON pumps;
CREATE POLICY "Admin/Manager can insert pumps" ON pumps FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin/Manager can update pumps" ON pumps;
CREATE POLICY "Admin/Manager can update pumps" ON pumps FOR UPDATE USING (true);

-- Pump Nozzles RLS
DROP POLICY IF EXISTS "Anyone can view pump nozzles" ON pump_nozzles;
CREATE POLICY "Anyone can view pump nozzles" ON pump_nozzles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin/Manager can insert pump nozzles" ON pump_nozzles;
CREATE POLICY "Admin/Manager can insert pump nozzles" ON pump_nozzles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin/Manager can update pump nozzles" ON pump_nozzles;
CREATE POLICY "Admin/Manager can update pump nozzles" ON pump_nozzles FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Admin/Manager can delete pump nozzles" ON pump_nozzles;
CREATE POLICY "Admin/Manager can delete pump nozzles" ON pump_nozzles FOR DELETE USING (true);

-- Pump Readings RLS
DROP POLICY IF EXISTS "Anyone can view pump readings" ON pump_readings;
CREATE POLICY "Anyone can view pump readings" ON pump_readings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Attendants can insert pump readings" ON pump_readings;
CREATE POLICY "Attendants can insert pump readings" ON pump_readings FOR INSERT WITH CHECK (true);

-- Pump Assignments RLS
DROP POLICY IF EXISTS "Anyone can view pump assignments" ON pump_assignments;
CREATE POLICY "Anyone can view pump assignments" ON pump_assignments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin/Manager/Supervisor can insert pump assignments" ON pump_assignments;
CREATE POLICY "Admin/Manager/Supervisor can insert pump assignments" ON pump_assignments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin/Manager/Supervisor can update pump assignments" ON pump_assignments;
CREATE POLICY "Admin/Manager/Supervisor can update pump assignments" ON pump_assignments FOR UPDATE USING (true);
