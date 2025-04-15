-- Ensure the updated_at trigger function exists
-- CREATE OR REPLACE FUNCTION trigger_set_timestamp()...

-- Create patient_insurances table
CREATE TABLE patient_insurances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  insurance_id uuid NOT NULL REFERENCES insurances(id) ON DELETE CASCADE,
  policy_number text NOT NULL,
  group_number text,
  subscriber_name text,
  effective_date date,
  expiration_date date,
  notes text,
  documents jsonb DEFAULT '[]'::jsonb -- Array to store document metadata
);

-- Add indexes
CREATE INDEX idx_patient_insurances_patient_id ON patient_insurances(patient_id);
CREATE INDEX idx_patient_insurances_insurance_id ON patient_insurances(insurance_id);

-- Trigger to automatically update updated_at timestamp
CREATE TRIGGER set_patient_insurances_timestamp
BEFORE UPDATE ON patient_insurances
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Enable Row Level Security (RLS)
ALTER TABLE patient_insurances ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow users to manage insurance records for patients they can access
-- Assumes users access patients via the 'user_id' link on the patients table.
CREATE POLICY "Users can manage insurance for accessible patients" ON patient_insurances
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = patient_insurances.patient_id AND p.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = patient_insurances.patient_id AND p.user_id = auth.uid()
    )
  );

-- Optional: RLS Policy for service_role or specific admin roles to bypass RLS
-- CREATE POLICY "Allow full access for admins" ON patient_insurances ...

COMMENT ON TABLE patient_insurances IS 'Stores patient-specific insurance policy information.';
COMMENT ON COLUMN patient_insurances.patient_id IS 'The patient associated with this insurance record.';
COMMENT ON COLUMN patient_insurances.insurance_id IS 'The insurance provider for this record.';
COMMENT ON COLUMN patient_insurances.policy_number IS 'The patient''s policy number with the provider.';
COMMENT ON COLUMN patient_insurances.documents IS 'JSON array storing metadata about uploaded insurance documents (e.g., card scans).';
