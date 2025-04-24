-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  scheduled_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER,
  status TEXT DEFAULT 'scheduled',
  type TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and create policies for patients
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON patients
  FOR SELECT USING (true);
  
CREATE POLICY "Enable insert for authenticated users" ON patients
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  
CREATE POLICY "Enable update for authenticated users" ON patients
  FOR UPDATE USING (auth.role() = 'authenticated');
  
CREATE POLICY "Enable delete for authenticated users" ON patients
  FOR DELETE USING (auth.role() = 'authenticated');

-- Enable RLS and create policies for sessions
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON sessions
  FOR SELECT USING (true);
  
CREATE POLICY "Enable insert for authenticated users" ON sessions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  
CREATE POLICY "Enable update for authenticated users" ON sessions
  FOR UPDATE USING (auth.role() = 'authenticated');
  
CREATE POLICY "Enable delete for authenticated users" ON sessions
  FOR DELETE USING (auth.role() = 'authenticated');
