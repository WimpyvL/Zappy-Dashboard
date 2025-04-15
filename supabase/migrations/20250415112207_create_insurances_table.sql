-- Ensure the updated_at trigger function exists
-- CREATE OR REPLACE FUNCTION trigger_set_timestamp()...

-- Create insurances table
CREATE TABLE insurances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  name text UNIQUE NOT NULL,
  contact_email text,
  contact_phone text,
  address jsonb,
  notes text,
  is_active boolean NOT NULL DEFAULT true,

  CONSTRAINT proper_email CHECK (contact_email IS NULL OR contact_email ~* '^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$')
);

-- Add indexes
CREATE INDEX idx_insurances_name ON insurances(name);
CREATE INDEX idx_insurances_is_active ON insurances(is_active);

-- Trigger to automatically update updated_at timestamp
CREATE TRIGGER set_insurances_timestamp
BEFORE UPDATE ON insurances
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Enable Row Level Security (RLS)
ALTER TABLE insurances ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow admins (or specific roles) to manage insurances
-- Replace 'admin_role_check()' with your actual role checking mechanism
CREATE POLICY "Allow admin management of insurances" ON insurances
  FOR ALL USING (auth.role() = 'service_role' /* OR admin_role_check() */)
  WITH CHECK (auth.role() = 'service_role' /* OR admin_role_check() */);

-- RLS Policy: Allow authenticated users to view active insurances
CREATE POLICY "Allow users to view active insurances" ON insurances
  FOR SELECT USING (is_active = true);

COMMENT ON TABLE insurances IS 'Stores information about insurance providers.';
COMMENT ON COLUMN insurances.name IS 'The name of the insurance company.';
COMMENT ON COLUMN insurances.is_active IS 'Whether this insurance provider is currently active/accepted.';
