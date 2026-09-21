-- Add missing columns for Step 7
ALTER TABLE tanks ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE tank_calibrations ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE'));

-- Enable RLS
ALTER TABLE tanks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tank_calibrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tank_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

-- Tanks RLS
DROP POLICY IF EXISTS "Anyone can view tanks" ON tanks;
CREATE POLICY "Anyone can view tanks" ON tanks FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin/Manager can insert tanks" ON tanks;
CREATE POLICY "Admin/Manager can insert tanks" ON tanks FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin/Manager can update tanks" ON tanks;
CREATE POLICY "Admin/Manager can update tanks" ON tanks FOR UPDATE USING (true);

-- Tank Calibrations RLS
DROP POLICY IF EXISTS "Anyone can view tank calibrations" ON tank_calibrations;
CREATE POLICY "Anyone can view tank calibrations" ON tank_calibrations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin/Manager can insert tank calibrations" ON tank_calibrations;
CREATE POLICY "Admin/Manager can insert tank calibrations" ON tank_calibrations FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin/Manager can update tank calibrations" ON tank_calibrations;
CREATE POLICY "Admin/Manager can update tank calibrations" ON tank_calibrations FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Admin/Manager can delete tank calibrations" ON tank_calibrations;
CREATE POLICY "Admin/Manager can delete tank calibrations" ON tank_calibrations FOR DELETE USING (true);

-- Tank Readings RLS
DROP POLICY IF EXISTS "Anyone can view tank readings" ON tank_readings;
CREATE POLICY "Anyone can view tank readings" ON tank_readings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin/Manager can insert tank readings" ON tank_readings;
CREATE POLICY "Admin/Manager can insert tank readings" ON tank_readings FOR INSERT WITH CHECK (true);

-- Employees RLS (Read-only for now)
DROP POLICY IF EXISTS "Anyone can view employees" ON employees;
CREATE POLICY "Anyone can view employees" ON employees FOR SELECT USING (true);

-- Shifts RLS (Read-only for now)
DROP POLICY IF EXISTS "Anyone can view shifts" ON shifts;
CREATE POLICY "Anyone can view shifts" ON shifts FOR SELECT USING (true);
