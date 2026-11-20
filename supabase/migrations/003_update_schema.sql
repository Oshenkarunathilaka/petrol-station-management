-- Run this in your Supabase SQL Editor
ALTER TABLE fuel_types ADD COLUMN description TEXT;

-- Also, ensure RLS allows operations on fuel_types and fuel_prices
-- (This requires the tables to have policies, assuming they don't have RLS or we add permissive RLS for logged-in users)

ALTER TABLE fuel_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_prices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view fuel types" ON fuel_types;
CREATE POLICY "Anyone can view fuel types" ON fuel_types FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin/Manager can insert fuel types" ON fuel_types;
CREATE POLICY "Admin/Manager can insert fuel types" ON fuel_types FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin/Manager can update fuel types" ON fuel_types;
CREATE POLICY "Admin/Manager can update fuel types" ON fuel_types FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anyone can view fuel prices" ON fuel_prices;
CREATE POLICY "Anyone can view fuel prices" ON fuel_prices FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin/Manager can insert fuel prices" ON fuel_prices;
CREATE POLICY "Admin/Manager can insert fuel prices" ON fuel_prices FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin/Manager can update fuel prices" ON fuel_prices;
CREATE POLICY "Admin/Manager can update fuel prices" ON fuel_prices FOR UPDATE USING (true);
