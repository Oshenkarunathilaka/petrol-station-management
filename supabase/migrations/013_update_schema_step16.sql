-- Step 16: Incident Management

-- 1. Modify existing `incidents` table to support new requirements
ALTER TABLE incidents
  -- Add resolution tracking
  ADD COLUMN IF NOT EXISTS resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS resolved_date TIMESTAMP WITH TIME ZONE,
  
  -- Add additional notes
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. Modify constraint for incident_type to use the new standardized UPPERCASE constants
-- Drop the existing constraint
ALTER TABLE incidents DROP CONSTRAINT IF EXISTS incidents_incident_type_check;

-- Update any existing data to match the new format (if any exists)
UPDATE incidents SET incident_type = 'FUEL_LEAKAGE_SPILL' WHERE incident_type = 'Fuel leakage' OR incident_type = 'Fuel spill';
UPDATE incidents SET incident_type = 'PUMP_FAILURE' WHERE incident_type = 'Pump failure';
UPDATE incidents SET incident_type = 'EQUIPMENT_DAMAGE' WHERE incident_type = 'Equipment damage';
UPDATE incidents SET incident_type = 'POWER_FAILURE' WHERE incident_type = 'Power failure';
UPDATE incidents SET incident_type = 'CASH_DISCREPANCY' WHERE incident_type = 'Cash discrepancy';
UPDATE incidents SET incident_type = 'OTHER' WHERE incident_type = 'Other';

-- Add the new constraint
ALTER TABLE incidents ADD CONSTRAINT incidents_incident_type_check 
  CHECK (incident_type IN ('FUEL_LEAKAGE_SPILL', 'PUMP_FAILURE', 'EQUIPMENT_DAMAGE', 'POWER_FAILURE', 'CASH_DISCREPANCY', 'OTHER'));

-- 3. Ensure location is NOT NULL
-- If there are null locations, set them to 'Unknown' first to avoid constraint violation
UPDATE incidents SET location = 'Unknown' WHERE location IS NULL;
ALTER TABLE incidents ALTER COLUMN location SET NOT NULL;

-- 4. Create indices for dashboard queries
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_priority ON incidents(priority);
CREATE INDEX IF NOT EXISTS idx_incidents_date ON incidents(incident_date DESC);
