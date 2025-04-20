BEGIN;

-- 1. Update consultations table to reference patients instead of client_record
ALTER TABLE consultations 
  DROP CONSTRAINT IF EXISTS consultations_client_id_fkey,
  ADD CONSTRAINT consultations_client_id_fkey 
  FOREIGN KEY (client_id) REFERENCES patients(id) ON DELETE CASCADE;

-- 2. Recreate services table if it was dropped (with RLS)
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  duration INTEGER, -- in minutes
  category TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read services
CREATE POLICY "Enable read access for authenticated users" 
ON services FOR SELECT
TO authenticated
USING (true);

-- 3. Update any other tables that reference client_record
-- (Add similar ALTER TABLE statements here if needed)

-- Update realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE services;

COMMIT;
