-- Create patients table to match schema expectations
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  date_of_birth DATE,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  insurance_provider TEXT,
  insurance_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments to explain the table purpose
COMMENT ON TABLE public.patients IS 'Stores patient/client records for the system';
COMMENT ON COLUMN public.patients.id IS 'Primary key';
COMMENT ON COLUMN public.patients.first_name IS 'Patient first name';
COMMENT ON COLUMN public.patients.last_name IS 'Patient last name';
