-- Update providers table with new fields for professional details and availability
ALTER TABLE providers
ADD COLUMN IF NOT EXISTS credentials TEXT,
ADD COLUMN IF NOT EXISTS license_number TEXT,
ADD COLUMN IF NOT EXISTS biography TEXT,
ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
ADD COLUMN IF NOT EXISTS availability_status TEXT DEFAULT 'available',
ADD COLUMN IF NOT EXISTS availability_start TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS availability_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'provider';

-- Add comment to explain the purpose of these fields
COMMENT ON COLUMN providers.credentials IS 'Professional credentials (e.g., MD, NP, PA)';
COMMENT ON COLUMN providers.license_number IS 'Professional license number';
COMMENT ON COLUMN providers.biography IS 'Professional biography and background information';
COMMENT ON COLUMN providers.profile_image_url IS 'URL to provider profile image';
COMMENT ON COLUMN providers.availability_status IS 'Current availability status (available, vacation, day_off)';
COMMENT ON COLUMN providers.availability_start IS 'Start date of unavailability period';
COMMENT ON COLUMN providers.availability_end IS 'End date of unavailability period';
COMMENT ON COLUMN providers.role IS 'Provider role (provider, admin)';

-- Create RLS policies for providers based on role
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;

-- Admin can do anything
CREATE POLICY "Admins can do anything on providers" ON providers
FOR ALL
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Providers can read all providers
CREATE POLICY "Providers can view all providers" ON providers
FOR SELECT
TO authenticated
USING (auth.jwt() ->> 'role' = 'provider');

-- Providers can update their own record
CREATE POLICY "Providers can update their own record" ON providers
FOR UPDATE
TO authenticated
USING (auth.uid()::text = id)
WITH CHECK (auth.uid()::text = id);
