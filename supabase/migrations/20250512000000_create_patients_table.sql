-- Create patients table if it doesn't exist
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(50),
  date_of_birth DATE,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  zip VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on patient name for faster searching
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(first_name, last_name);

-- Create index on patient email for faster searching
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);

-- Insert test patients if they don't exist
INSERT INTO patients (first_name, last_name, email, phone, date_of_birth, address, city, state, zip)
VALUES 
  ('Test', 'Patient', 'test.patient@example.com', '555-123-4567', '1990-01-01', '123 Test St', 'Test City', 'TS', '12345'),
  ('Jane', 'Doe', 'jane.doe@example.com', '555-987-6543', '1985-05-15', '456 Sample Ave', 'Sample City', 'SC', '54321')
ON CONFLICT (email) DO NOTHING;
