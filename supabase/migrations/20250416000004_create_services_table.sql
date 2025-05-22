-- Create services table if it doesn't exist
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  duration_minutes INTEGER,
  category TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  active BOOLEAN DEFAULT TRUE,
  requires_consultation BOOLEAN DEFAULT FALSE,
  associated_products JSONB DEFAULT '[]'::jsonb,
  available_plans JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on the services table
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Create policies for the services table
DROP POLICY IF EXISTS "Allow all users to view services" ON services;
CREATE POLICY "Allow all users to view services"
  ON services
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to create services" ON services;
CREATE POLICY "Allow authenticated users to create services"
  ON services
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to update services" ON services;
CREATE POLICY "Allow authenticated users to update services"
  ON services
  FOR UPDATE
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to delete services" ON services;
CREATE POLICY "Allow authenticated users to delete services"
  ON services
  FOR DELETE
  TO authenticated
  USING (true);

-- Add the table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE services;
