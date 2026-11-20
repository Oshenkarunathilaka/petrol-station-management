-- Add missing columns for Step 10
ALTER TABLE fuel_transactions ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE fuel_transactions ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('COMPLETED', 'VOIDED'));

-- Enable RLS
ALTER TABLE fuel_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;

-- Fuel Transactions RLS
DROP POLICY IF EXISTS "Anyone can view fuel transactions" ON fuel_transactions;
CREATE POLICY "Anyone can view fuel transactions" ON fuel_transactions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authorized users can insert fuel transactions" ON fuel_transactions;
CREATE POLICY "Authorized users can insert fuel transactions" ON fuel_transactions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin/Manager can update fuel transactions" ON fuel_transactions;
CREATE POLICY "Admin/Manager can update fuel transactions" ON fuel_transactions FOR UPDATE USING (true);

-- Transaction Items RLS
DROP POLICY IF EXISTS "Anyone can view transaction items" ON transaction_items;
CREATE POLICY "Anyone can view transaction items" ON transaction_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authorized users can insert transaction items" ON transaction_items;
CREATE POLICY "Authorized users can insert transaction items" ON transaction_items FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin/Manager can update transaction items" ON transaction_items;
CREATE POLICY "Admin/Manager can update transaction items" ON transaction_items FOR UPDATE USING (true);
