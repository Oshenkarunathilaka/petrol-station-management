-- Safe seed script for initial fuel types

INSERT INTO public.fuel_types (name, code, unit, status) 
VALUES 
  ('Petrol Octane 92', 'P92', 'Liters', 'ACTIVE'),
  ('Petrol Octane 95', 'P95', 'Liters', 'ACTIVE'),
  ('Auto Diesel', 'AD', 'Liters', 'ACTIVE'),
  ('Super Diesel', 'SD', 'Liters', 'ACTIVE'),
  ('Kerosene / Lamp Oil', 'KERO', 'Liters', 'ACTIVE')
ON CONFLICT (name) DO NOTHING;

-- Note: We use ON CONFLICT (name) DO NOTHING because the 'name' column is marked as UNIQUE.
-- This ensures that if you run this script multiple times, it will simply ignore the insert 
-- if the fuel type already exists, preventing any duplicate key errors.
