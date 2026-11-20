-- Step 14: Expense Management

-- 1. Add notes column to expenses
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. Update category constraint to allow UPPERCASE categories (or standard Title Case)
-- We will relax the constraint to allow both Title Case and UPPERCASE to ensure seamless mapping
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_category_check;
ALTER TABLE expenses ADD CONSTRAINT expenses_category_check CHECK (
    category IN ('Electricity', 'ELECTRICITY', 'Maintenance', 'MAINTENANCE', 'Transport', 'TRANSPORT', 'Equipment', 'EQUIPMENT', 'Salary', 'SALARY', 'Other', 'OTHER')
);
