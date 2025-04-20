BEGIN;

-- 1. Create missing profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Create missing api_logs table
CREATE TABLE IF NOT EXISTS api_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER,
  user_id UUID REFERENCES profiles(id),
  request_body JSONB,
  response_body JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create missing questionnaire table
CREATE TABLE IF NOT EXISTS questionnaire (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create missing pb_tasks table
CREATE TABLE IF NOT EXISTS pb_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  assignee_id UUID REFERENCES profiles(id),
  patient_id UUID REFERENCES patients(id),
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Fix insurance_records foreign key
ALTER TABLE insurance_records
  DROP CONSTRAINT IF EXISTS insurance_records_client_id_fkey,
  ADD CONSTRAINT insurance_records_patient_id_fkey
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE;

-- 6. Add missing name column to discounts
ALTER TABLE discounts
  ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT 'Discount';

-- Add tables to realtime publication with error handling
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    -- Check and add each table individually
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'profiles') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'api_logs') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE api_logs;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'questionnaire') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE questionnaire;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'pb_tasks') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE pb_tasks;
    END IF;
  END IF;
END $$;

COMMIT;
