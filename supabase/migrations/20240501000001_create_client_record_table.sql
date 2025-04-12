-- Create client_record table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.client_record (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  client_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  status TEXT DEFAULT 'active',
  notes TEXT
);

-- Enable row level security
ALTER TABLE public.client_record ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Allow anonymous select access" ON public.client_record;
CREATE POLICY "Allow anonymous select access"
  ON public.client_record
  FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated full access" ON public.client_record;
CREATE POLICY "Allow authenticated full access"
  ON public.client_record
  FOR ALL
  TO authenticated
  USING (true);

-- Enable realtime
alter publication supabase_realtime add table client_record;
