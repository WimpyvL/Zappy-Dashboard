-- Function to update the updated_at column
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create patients table
CREATE TABLE patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- Link to auth user, SET NULL if user deleted
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE,
  dob date,
  -- Add other relevant fields here based on application needs
  -- e.g., phone text, address jsonb, status text
  CONSTRAINT proper_email CHECK (email ~* '^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$') -- Basic email format check
);

-- Add indexes
CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_patients_email ON patients(email);

-- Trigger to automatically update updated_at timestamp
CREATE TRIGGER set_patients_timestamp
BEFORE UPDATE ON patients
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Enable Row Level Security (RLS)
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow users to manage their own patient records
-- Assumes a direct link via user_id. Adjust if relationship is different (e.g., via organization)
CREATE POLICY "Users can manage their own patients" ON patients
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Optional: RLS Policy for service_role or specific admin roles to bypass RLS
-- CREATE POLICY "Allow full access for admins" ON patients
--   FOR ALL USING (get_my_claim('user_role') = '"admin"'); -- Example using custom claims

COMMENT ON TABLE patients IS 'Stores patient information for the Zappy dashboard.';
COMMENT ON COLUMN patients.user_id IS 'Links patient record to the authenticated user who manages it.';
