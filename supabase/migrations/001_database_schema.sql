-- Supabase PostgreSQL Schema for Petrol Station Management System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. roles
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Insert initial roles
INSERT INTO roles (name, description) VALUES
('ADMIN', 'System Administrator'),
('MANAGER', 'Station Manager'),
('SUPERVISOR', 'Shift Supervisor'),
('CASHIER', 'Cashier'),
('ATTENDANT', 'Pump Attendant');

-- 3. employees
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_code TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    position TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ON_LEAVE')),
    hire_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 1. profiles
CREATE TABLE profiles (
    id UUID PRIMARY KEY, -- Maps to auth.users.id
    full_name TEXT NOT NULL,
    email TEXT UNIQUE,
    role_id UUID REFERENCES roles(id) ON DELETE RESTRICT,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 4. fuel_types
CREATE TABLE fuel_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE,
    unit TEXT NOT NULL DEFAULT 'Liters',
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Insert initial fuel types
INSERT INTO fuel_types (name, code) VALUES
('Petrol Octane 92', 'P92'),
('Petrol Octane 95', 'P95'),
('Auto Diesel', 'AD'),
('Super Diesel', 'SD'),
('Kerosene / Lamp Oil', 'KERO');

-- 5. fuel_prices
CREATE TABLE fuel_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fuel_type_id UUID NOT NULL REFERENCES fuel_types(id) ON DELETE RESTRICT,
    price_per_liter NUMERIC(12, 2) NOT NULL CHECK (price_per_liter >= 0),
    effective_from TIMESTAMP WITH TIME ZONE NOT NULL,
    effective_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    CHECK (effective_until IS NULL OR effective_from < effective_until)
);

-- 6. tanks
CREATE TABLE tanks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tank_number TEXT NOT NULL UNIQUE,
    fuel_type_id UUID NOT NULL REFERENCES fuel_types(id) ON DELETE RESTRICT,
    capacity_liters NUMERIC(12, 2) NOT NULL CHECK (capacity_liters > 0),
    minimum_stock_liters NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (minimum_stock_liters >= 0),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'MAINTENANCE', 'OFFLINE')),
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 7. tank_calibrations
CREATE TABLE tank_calibrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tank_id UUID NOT NULL REFERENCES tanks(id) ON DELETE CASCADE,
    height_cm NUMERIC(10, 2) NOT NULL CHECK (height_cm >= 0),
    quantity_liters NUMERIC(12, 2) NOT NULL CHECK (quantity_liters >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE (tank_id, height_cm)
);

-- 15. shifts
CREATE TABLE shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    shift_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 8. tank_readings
CREATE TABLE tank_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tank_id UUID NOT NULL REFERENCES tanks(id) ON DELETE RESTRICT,
    reading_date DATE NOT NULL,
    reading_time TIME NOT NULL,
    height_cm NUMERIC(10, 2) NOT NULL CHECK (height_cm >= 0),
    calculated_liters NUMERIC(12, 2) NOT NULL CHECK (calculated_liters >= 0),
    employee_id UUID REFERENCES employees(id) ON DELETE RESTRICT,
    shift_id UUID REFERENCES shifts(id) ON DELETE RESTRICT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 9. pumps
CREATE TABLE pumps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pump_number TEXT NOT NULL UNIQUE,
    location TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'MAINTENANCE', 'OFFLINE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 10. pump_nozzles
CREATE TABLE pump_nozzles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pump_id UUID NOT NULL REFERENCES pumps(id) ON DELETE CASCADE,
    nozzle_number INTEGER NOT NULL,
    fuel_type_id UUID NOT NULL REFERENCES fuel_types(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'MAINTENANCE', 'OFFLINE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE (pump_id, nozzle_number)
);

-- 11. pump_readings
CREATE TABLE pump_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nozzle_id UUID NOT NULL REFERENCES pump_nozzles(id) ON DELETE RESTRICT,
    reading_date DATE NOT NULL,
    reading_time TIME NOT NULL,
    previous_meter NUMERIC(14, 2) NOT NULL CHECK (previous_meter >= 0),
    current_meter NUMERIC(14, 2) NOT NULL CHECK (current_meter >= previous_meter),
    fuel_sold_liters NUMERIC(14, 2) GENERATED ALWAYS AS (current_meter - previous_meter) STORED,
    employee_id UUID REFERENCES employees(id) ON DELETE RESTRICT,
    shift_id UUID REFERENCES shifts(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 12. pump_assignments
CREATE TABLE pump_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pump_id UUID NOT NULL REFERENCES pumps(id) ON DELETE RESTRICT,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE RESTRICT,
    assigned_from TIMESTAMP WITH TIME ZONE NOT NULL,
    assigned_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 13. suppliers
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    contact_name TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 14. fuel_deliveries
CREATE TABLE fuel_deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    fuel_type_id UUID NOT NULL REFERENCES fuel_types(id) ON DELETE RESTRICT,
    tank_id UUID NOT NULL REFERENCES tanks(id) ON DELETE RESTRICT,
    quantity_liters NUMERIC(12, 2) NOT NULL CHECK (quantity_liters > 0),
    purchase_price NUMERIC(12, 2) NOT NULL CHECK (purchase_price >= 0),
    invoice_number TEXT,
    delivery_date TIMESTAMP WITH TIME ZONE NOT NULL,
    received_by UUID REFERENCES employees(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELLED')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 16. shift_assignments
CREATE TABLE shift_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE RESTRICT,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    role TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 17. shift_readings
CREATE TABLE shift_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE RESTRICT,
    pump_id UUID NOT NULL REFERENCES pumps(id) ON DELETE RESTRICT,
    opening_reading NUMERIC(14, 2) NOT NULL CHECK (opening_reading >= 0),
    closing_reading NUMERIC(14, 2) NOT NULL CHECK (closing_reading >= opening_reading),
    fuel_sold_liters NUMERIC(14, 2) GENERATED ALWAYS AS (closing_reading - opening_reading) STORED,
    expected_cash NUMERIC(12, 2) NOT NULL,
    actual_cash NUMERIC(12, 2) NOT NULL,
    cash_variance NUMERIC(12, 2) GENERATED ALWAYS AS (actual_cash - expected_cash) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 18. fuel_transactions
CREATE TABLE fuel_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    pump_id UUID NOT NULL REFERENCES pumps(id) ON DELETE RESTRICT,
    employee_id UUID REFERENCES employees(id) ON DELETE RESTRICT,
    shift_id UUID REFERENCES shifts(id) ON DELETE RESTRICT,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('CASH', 'CARD', 'QR', 'OTHER')),
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 19. transaction_items
CREATE TABLE transaction_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES fuel_transactions(id) ON DELETE CASCADE,
    nozzle_id UUID NOT NULL REFERENCES pump_nozzles(id) ON DELETE RESTRICT,
    fuel_type_id UUID NOT NULL REFERENCES fuel_types(id) ON DELETE RESTRICT,
    quantity_liters NUMERIC(10, 2) NOT NULL CHECK (quantity_liters > 0),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    total_amount NUMERIC(12, 2) GENERATED ALWAYS AS (quantity_liters * unit_price) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 20. inventory_items
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT,
    unit TEXT,
    minimum_stock NUMERIC(10, 2) NOT NULL DEFAULT 0,
    current_stock NUMERIC(10, 2) NOT NULL DEFAULT 0,
    selling_price NUMERIC(12, 2) NOT NULL CHECK (selling_price >= 0),
    cost_price NUMERIC(12, 2) NOT NULL CHECK (cost_price >= 0),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 21. inventory_transactions
CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE RESTRICT,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('PURCHASE', 'SALE', 'ADJUSTMENT')),
    quantity NUMERIC(10, 2) NOT NULL,
    reference TEXT,
    notes TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 22. expenses
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL CHECK (category IN ('Electricity', 'Maintenance', 'Transport', 'Equipment', 'Salary', 'Other')),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    expense_date DATE NOT NULL,
    description TEXT,
    invoice_reference TEXT,
    recorded_by UUID REFERENCES profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 23. maintenance
CREATE TABLE maintenance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_type TEXT NOT NULL,
    equipment_id UUID NOT NULL,
    issue TEXT NOT NULL,
    reported_date DATE NOT NULL,
    technician TEXT,
    cost NUMERIC(12, 2) DEFAULT 0 CHECK (cost >= 0),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    completed_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 24. incidents
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_type TEXT NOT NULL CHECK (incident_type IN ('Fuel leakage', 'Fuel spill', 'Pump failure', 'Equipment damage', 'Power failure', 'Cash discrepancy', 'Other')),
    location TEXT,
    description TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    reported_by UUID REFERENCES profiles(id) ON DELETE RESTRICT,
    incident_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED')),
    resolution TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 25. audit_logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    module TEXT NOT NULL,
    record_id UUID NOT NULL,
    old_value JSONB,
    new_value JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 26. report_exports
CREATE TABLE report_exports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_type TEXT NOT NULL,
    date_from DATE,
    date_to DATE,
    filters JSONB,
    generated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    file_name TEXT NOT NULL
);

-- INDEXES
CREATE INDEX idx_profiles_role ON profiles(role_id);
CREATE INDEX idx_fuel_prices_fuel_type ON fuel_prices(fuel_type_id);
CREATE INDEX idx_tanks_fuel_type ON tanks(fuel_type_id);
CREATE INDEX idx_pump_nozzles_pump ON pump_nozzles(pump_id);
CREATE INDEX idx_fuel_deliveries_date ON fuel_deliveries(delivery_date);
CREATE INDEX idx_pump_readings_nozzle ON pump_readings(nozzle_id);
CREATE INDEX idx_pump_readings_shift ON pump_readings(shift_id);
CREATE INDEX idx_fuel_transactions_date ON fuel_transactions(transaction_date);
CREATE INDEX idx_inventory_tx_item ON inventory_transactions(inventory_item_id);

-- UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- ASSIGN TRIGGER TO RELEVANT TABLES
CREATE TRIGGER set_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER set_fuel_types_updated_at BEFORE UPDATE ON fuel_types FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER set_tanks_updated_at BEFORE UPDATE ON tanks FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER set_shifts_updated_at BEFORE UPDATE ON shifts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER set_pumps_updated_at BEFORE UPDATE ON pumps FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER set_pump_nozzles_updated_at BEFORE UPDATE ON pump_nozzles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER set_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER set_inventory_items_updated_at BEFORE UPDATE ON inventory_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER set_maintenance_updated_at BEFORE UPDATE ON maintenance FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER set_incidents_updated_at BEFORE UPDATE ON incidents FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
