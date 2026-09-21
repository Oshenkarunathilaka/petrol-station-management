-- Run this script in the Supabase SQL Editor to fix the RLS permission issues

-- 1. Enable RLS on tables (just in case they aren't already)
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to prevent conflicts if you run this multiple times
DROP POLICY IF EXISTS "Anyone can view roles" ON roles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- 3. Create Policy: Allow ANYONE to read the roles table (it's a static lookup table)
CREATE POLICY "Anyone can view roles" 
ON roles FOR SELECT 
USING (true);

-- 4. Create Policy: Allow logged-in users to read THEIR OWN profile
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

-- 5. Create Policy: Allow users to insert THEIR OWN profile during sign-up
CREATE POLICY "Users can insert own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 6. Also ensure the standard roles exist just in case they were deleted
INSERT INTO roles (name, description) 
VALUES 
  ('ADMIN', 'System Administrator'),
  ('MANAGER', 'Station Manager'),
  ('SUPERVISOR', 'Shift Supervisor'),
  ('CASHIER', 'Cashier'),
  ('ATTENDANT', 'Pump Attendant')
ON CONFLICT (name) DO NOTHING;
