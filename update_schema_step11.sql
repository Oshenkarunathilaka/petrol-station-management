-- Add missing columns for Step 11
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE fuel_deliveries ADD COLUMN IF NOT EXISTS reference TEXT;

-- Update fuel_deliveries check constraint to support PENDING, CONFIRMED, CANCELLED (if needed)
ALTER TABLE fuel_deliveries DROP CONSTRAINT IF EXISTS fuel_deliveries_status_check;
ALTER TABLE fuel_deliveries ADD CONSTRAINT fuel_deliveries_status_check CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'));

-- Enable RLS
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_deliveries ENABLE ROW LEVEL SECURITY;

-- Suppliers RLS
DROP POLICY IF EXISTS "Anyone can view suppliers" ON suppliers;
CREATE POLICY "Anyone can view suppliers" ON suppliers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authorized users can insert suppliers" ON suppliers;
CREATE POLICY "Authorized users can insert suppliers" ON suppliers FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Authorized users can update suppliers" ON suppliers;
CREATE POLICY "Authorized users can update suppliers" ON suppliers FOR UPDATE USING (true);

-- Fuel Deliveries RLS
DROP POLICY IF EXISTS "Anyone can view fuel deliveries" ON fuel_deliveries;
CREATE POLICY "Anyone can view fuel deliveries" ON fuel_deliveries FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authorized users can insert fuel deliveries" ON fuel_deliveries;
CREATE POLICY "Authorized users can insert fuel deliveries" ON fuel_deliveries FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Authorized users can update fuel deliveries" ON fuel_deliveries;
CREATE POLICY "Authorized users can update fuel deliveries" ON fuel_deliveries FOR UPDATE USING (true);
