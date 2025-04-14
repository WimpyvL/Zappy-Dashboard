-- Create pharmacies table

-- First, ensure the uuid-ossp extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create pharmacies table
CREATE TABLE IF NOT EXISTS pharmacies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  phone TEXT,
  fax TEXT,
  email TEXT,
  website TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime for this table, only if it isn't already added
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'pharmacies') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.pharmacies;
  END IF;
END $$;

-- Insert some sample data
INSERT INTO pharmacies (name, address, city, state, zip, phone, is_active)
VALUES
  ('Walgreens', '123 Main St', 'Chicago', 'IL', '60601', '(312) 555-1234', true),
  ('CVS Pharmacy', '456 Oak Ave', 'Boston', 'MA', '02108', '(617) 555-5678', true),
  ('Rite Aid', '789 Pine Blvd', 'New York', 'NY', '10001', '(212) 555-9012', true),
  ('Medicine Shoppe', '321 Elm St', 'Dallas', 'TX', '75201', '(214) 555-3456', true),
  ('Walmart Pharmacy', '654 Maple Dr', 'Atlanta', 'GA', '30301', '(404) 555-7890', true);
