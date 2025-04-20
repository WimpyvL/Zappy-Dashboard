BEGIN;

-- Rename client_record to patients
ALTER TABLE client_record RENAME TO patients;

-- Add missing columns
ALTER TABLE patients
  ADD COLUMN status TEXT DEFAULT 'active',
  ADD COLUMN subscription_plan_id UUID REFERENCES subscription_plans(id),
  ADD COLUMN preferred_pharmacy UUID REFERENCES pharmacies(id),
  ADD COLUMN tags UUID[] DEFAULT array[]::UUID[];

-- Standardize timestamps (keep created_at, remove date_created)
ALTER TABLE patients
  DROP COLUMN IF EXISTS date_created,
  DROP COLUMN IF EXISTS date_modified;

-- Create RLS policies
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Policy: Patients can read their own data
CREATE POLICY "Patients can view their own data" 
ON patients FOR SELECT
USING (auth.uid() = id);

-- Policy: Admins have full access
CREATE POLICY "Admin full access"
ON patients FOR ALL
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Policy: Staff can read all patient data but only update specific fields
CREATE POLICY "Staff read access"
ON patients FOR SELECT
TO authenticated
USING (auth.jwt() ->> 'role' IN ('admin', 'staff'));

CREATE POLICY "Staff limited update"
ON patients FOR UPDATE
TO authenticated
USING (auth.jwt() ->> 'role' IN ('admin', 'staff'))
WITH CHECK (
  auth.jwt() ->> 'role' IN ('admin', 'staff') AND
  -- Prevent changing sensitive fields
  (status IS NOT DISTINCT FROM OLD.status) AND
  (subscription_plan_id IS NOT DISTINCT FROM OLD.subscription_plan_id)
);

COMMIT;
