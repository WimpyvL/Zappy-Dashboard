-- Ensure the updated_at trigger function exists
-- CREATE OR REPLACE FUNCTION trigger_set_timestamp()...

-- Create pharmacies table
CREATE TABLE pharmacies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  name text UNIQUE NOT NULL,
  address jsonb, -- Consider a structured format: { street, city, state, zip, country }
  contact_email text,
  contact_phone text,
  notes text,
  is_active boolean NOT NULL DEFAULT true,

  CONSTRAINT proper_email CHECK (contact_email IS NULL OR contact_email ~* '^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$')
);

-- Add indexes
CREATE INDEX idx_pharmacies_name ON pharmacies(name);
CREATE INDEX idx_pharmacies_is_active ON pharmacies(is_active);

-- Trigger to automatically update updated_at timestamp
CREATE TRIGGER set_pharmacies_timestamp
BEFORE UPDATE ON pharmacies
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Enable Row Level Security (RLS)
ALTER TABLE pharmacies ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow admins (or specific roles) to manage pharmacies
-- Replace 'admin_role_check()' with your actual role checking mechanism
CREATE POLICY "Allow admin management of pharmacies" ON pharmacies
  FOR ALL USING (auth.role() = 'service_role' /* OR admin_role_check() */)
  WITH CHECK (auth.role() = 'service_role' /* OR admin_role_check() */);

-- RLS Policy: Allow authenticated users to view active pharmacies
CREATE POLICY "Allow users to view active pharmacies" ON pharmacies
  FOR SELECT USING (is_active = true);

COMMENT ON TABLE pharmacies IS 'Stores information about pharmacies.';
COMMENT ON COLUMN pharmacies.name IS 'The name of the pharmacy.';
COMMENT ON COLUMN pharmacies.address IS 'Structured address information for the pharmacy.';
COMMENT ON COLUMN pharmacies.is_active IS 'Whether this pharmacy is currently active/partnered.';
