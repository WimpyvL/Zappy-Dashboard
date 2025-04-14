-- Create insurance_records table
CREATE TABLE IF NOT EXISTS insurance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_record_id UUID REFERENCES client_record(id) ON DELETE SET NULL, -- Link to patient
  provider_name TEXT NOT NULL,
  policy_number TEXT,
  group_number TEXT,
  subscriber_name TEXT,
  subscriber_dob DATE,
  status TEXT DEFAULT 'Pending', -- e.g., Pending, Verified, Rejected, Expired
  verification_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create insurance_documents table
CREATE TABLE IF NOT EXISTS insurance_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  insurance_record_id UUID REFERENCES insurance_records(id) ON DELETE CASCADE, -- Link to insurance record
  file_name TEXT NOT NULL, -- Original name of the uploaded file
  storage_path TEXT UNIQUE NOT NULL, -- Path in Supabase Storage
  url TEXT, -- Public or signed URL
  document_type TEXT, -- e.g., 'Insurance Card Front', 'Insurance Card Back', 'Explanation of Benefits'
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Optional: Link to user who uploaded
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  -- No updated_at needed if documents are immutable once uploaded
);

-- Enable realtime for these tables, only if they aren't already added
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'insurance_records') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.insurance_records;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'insurance_documents') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.insurance_documents;
  END IF;
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_insurance_records_client_record_id ON insurance_records (client_record_id);
CREATE INDEX IF NOT EXISTS idx_insurance_records_status ON insurance_records (status);
CREATE INDEX IF NOT EXISTS idx_insurance_documents_insurance_record_id ON insurance_documents (insurance_record_id);
