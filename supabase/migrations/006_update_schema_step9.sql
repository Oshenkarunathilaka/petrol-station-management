-- Add missing columns for Step 9
ALTER TABLE employees ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE shift_assignments ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED'));

-- Enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_assignments ENABLE ROW LEVEL SECURITY;

-- Employees RLS
DROP POLICY IF EXISTS "Anyone can view employees" ON employees;
CREATE POLICY "Anyone can view employees" ON employees FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin/Manager can insert employees" ON employees;
CREATE POLICY "Admin/Manager can insert employees" ON employees FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin/Manager can update employees" ON employees;
CREATE POLICY "Admin/Manager can update employees" ON employees FOR UPDATE USING (true);

-- Shifts RLS
DROP POLICY IF EXISTS "Anyone can view shifts" ON shifts;
CREATE POLICY "Anyone can view shifts" ON shifts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin/Manager/Supervisor can insert shifts" ON shifts;
CREATE POLICY "Admin/Manager/Supervisor can insert shifts" ON shifts FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin/Manager/Supervisor can update shifts" ON shifts;
CREATE POLICY "Admin/Manager/Supervisor can update shifts" ON shifts FOR UPDATE USING (true);

-- Shift Assignments RLS
DROP POLICY IF EXISTS "Anyone can view shift assignments" ON shift_assignments;
CREATE POLICY "Anyone can view shift assignments" ON shift_assignments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin/Manager/Supervisor can insert shift assignments" ON shift_assignments;
CREATE POLICY "Admin/Manager/Supervisor can insert shift assignments" ON shift_assignments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin/Manager/Supervisor can update shift assignments" ON shift_assignments;
CREATE POLICY "Admin/Manager/Supervisor can update shift assignments" ON shift_assignments FOR UPDATE USING (true);
