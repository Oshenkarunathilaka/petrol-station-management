-- Initial Schema for Petrol Station Management System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS (Extends Supabase auth.users)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'cashier')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- FUEL TYPES
CREATE TABLE public.fuel_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    current_price DECIMAL(10, 2) NOT NULL,
    color_code TEXT DEFAULT '#000000',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- STORAGE TANKS
CREATE TABLE public.storage_tanks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    fuel_type_id UUID REFERENCES public.fuel_types(id) ON DELETE RESTRICT,
    capacity_liters DECIMAL(10, 2) NOT NULL,
    current_volume_liters DECIMAL(10, 2) NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- FUEL PUMPS
CREATE TABLE public.fuel_pumps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- PUMP NOZZLES
CREATE TABLE public.pump_nozzles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pump_id UUID REFERENCES public.fuel_pumps(id) ON DELETE CASCADE,
    tank_id UUID REFERENCES public.storage_tanks(id) ON DELETE RESTRICT,
    nozzle_number INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(pump_id, nozzle_number)
);

-- SHIFTS
CREATE TABLE public.shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_roles(id) ON DELETE RESTRICT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    end_time TIMESTAMP WITH TIME ZONE,
    opening_cash DECIMAL(10, 2) NOT NULL,
    closing_cash DECIMAL(10, 2),
    expected_cash DECIMAL(10, 2),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- METER READINGS
CREATE TABLE public.meter_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shift_id UUID REFERENCES public.shifts(id) ON DELETE RESTRICT,
    nozzle_id UUID REFERENCES public.pump_nozzles(id) ON DELETE RESTRICT,
    opening_reading DECIMAL(12, 2) NOT NULL,
    closing_reading DECIMAL(12, 2),
    total_dispensed_liters DECIMAL(12, 2) GENERATED ALWAYS AS (closing_reading - opening_reading) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TRANSACTIONS
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shift_id UUID REFERENCES public.shifts(id) ON DELETE RESTRICT,
    nozzle_id UUID REFERENCES public.pump_nozzles(id) ON DELETE RESTRICT,
    volume_liters DECIMAL(10, 2) NOT NULL,
    price_per_liter DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) GENERATED ALWAYS AS (volume_liters * price_per_liter) STORED,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'account')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- SUPPLIERS
CREATE TABLE public.suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- FUEL DELIVERIES
CREATE TABLE public.fuel_deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE RESTRICT,
    tank_id UUID REFERENCES public.storage_tanks(id) ON DELETE RESTRICT,
    volume_liters DECIMAL(10, 2) NOT NULL,
    cost_per_liter DECIMAL(10, 2) NOT NULL,
    total_cost DECIMAL(10, 2) GENERATED ALWAYS AS (volume_liters * cost_per_liter) STORED,
    delivery_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- EXPENSES
CREATE TABLE public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    expense_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    created_by UUID REFERENCES public.user_roles(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- MAINTENANCE LOGS
CREATE TABLE public.maintenance_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_type TEXT NOT NULL CHECK (equipment_type IN ('pump', 'tank', 'other')),
    equipment_id UUID, -- Can link to pump_id or tank_id depending on type
    description TEXT NOT NULL,
    cost DECIMAL(10, 2) DEFAULT 0,
    maintenance_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- INCIDENTS
CREATE TABLE public.incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('spill', 'drive-off', 'accident', 'other')),
    description TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    incident_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    reported_by UUID REFERENCES public.user_roles(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- Row Level Security (RLS) Policies

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_tanks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_pumps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pump_nozzles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meter_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT role FROM public.user_roles WHERE id = auth.uid();
$$;

-- Universal Read Access for Authenticated Users (Simplified for internal app)
CREATE POLICY "Allow authenticated read access" ON public.user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON public.fuel_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON public.storage_tanks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON public.fuel_pumps FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON public.pump_nozzles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON public.shifts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON public.meter_readings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON public.transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON public.suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON public.fuel_deliveries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON public.expenses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON public.maintenance_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON public.incidents FOR SELECT TO authenticated USING (true);

-- Mutations (Insert/Update/Delete)
-- Admin can do everything
-- Manager can do most things
-- Cashier can only do shifts and transactions

-- (Policies can be expanded based on specific needs, but for now we'll allow authenticated users to mutate, 
-- and we'll enforce strict checks in the Next.js Server Actions)

CREATE POLICY "Allow authenticated insert/update" ON public.transactions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated insert/update" ON public.shifts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON public.shifts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert/update" ON public.meter_readings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON public.meter_readings FOR UPDATE TO authenticated USING (true);

-- (In a real production environment with untrusted clients, we would add strict RLS for every table and action.
-- For this internal app utilizing Server Actions, Server Actions will act as the security boundary as well.)
