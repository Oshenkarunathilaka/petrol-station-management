-- Step 13: Non-Fuel Inventory Management

-- 1. Add description column to inventory_items
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS description TEXT;

-- 2. Update transaction_type constraint in inventory_transactions
ALTER TABLE inventory_transactions DROP CONSTRAINT IF EXISTS inventory_transactions_transaction_type_check;
ALTER TABLE inventory_transactions ADD CONSTRAINT inventory_transactions_transaction_type_check CHECK (transaction_type IN ('PURCHASE', 'SALE', 'ADJUSTMENT', 'RETURN'));

-- 3. Create Trigger Function to update current_stock in inventory_items
CREATE OR REPLACE FUNCTION update_inventory_current_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.transaction_type = 'PURCHASE' OR NEW.transaction_type = 'RETURN' THEN
        UPDATE inventory_items 
        SET current_stock = current_stock + NEW.quantity 
        WHERE id = NEW.inventory_item_id;
    ELSIF NEW.transaction_type = 'SALE' THEN
        UPDATE inventory_items 
        SET current_stock = current_stock - NEW.quantity 
        WHERE id = NEW.inventory_item_id;
    ELSIF NEW.transaction_type = 'ADJUSTMENT' THEN
        -- Adjustment quantity can be positive or negative
        UPDATE inventory_items 
        SET current_stock = current_stock + NEW.quantity 
        WHERE id = NEW.inventory_item_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create Trigger on inventory_transactions
DROP TRIGGER IF EXISTS trg_update_inventory_stock ON inventory_transactions;
CREATE TRIGGER trg_update_inventory_stock
AFTER INSERT ON inventory_transactions
FOR EACH ROW
EXECUTE PROCEDURE update_inventory_current_stock();
