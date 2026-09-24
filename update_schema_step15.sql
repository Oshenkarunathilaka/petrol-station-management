-- Step 15: Maintenance Management

-- 1. Modify existing `maintenance` table to support new requirements
ALTER TABLE maintenance
  -- Make equipment_id nullable for external equipment
  ALTER COLUMN equipment_id DROP NOT NULL,
  
  -- Add equipment reference for non-DB tracked equipment
  ADD COLUMN IF NOT EXISTS equipment_reference TEXT;
  
-- Rename issue to description
ALTER TABLE maintenance RENAME COLUMN issue TO description;

ALTER TABLE maintenance
  ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT 'Maintenance Task',
  
  -- People tracking
  ADD COLUMN IF NOT EXISTS reported_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Dates tracking
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS expected_completion_date DATE,
  
  -- Priority tracking
  ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'));

-- Create an index for faster querying
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_priority ON maintenance(priority);
CREATE INDEX IF NOT EXISTS idx_maintenance_equipment_type ON maintenance(equipment_type);
