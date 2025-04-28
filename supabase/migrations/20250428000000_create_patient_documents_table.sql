-- Create patient_documents table for storing document metadata
CREATE TABLE IF NOT EXISTS public.patient_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  document_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  url TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.patient_documents IS 'Stores metadata for patient documents uploaded to storage';
COMMENT ON COLUMN public.patient_documents.patient_id IS 'Reference to the patient this document belongs to';
COMMENT ON COLUMN public.patient_documents.file_name IS 'Original filename of the uploaded document';
COMMENT ON COLUMN public.patient_documents.document_type IS 'Type of document (e.g., id, insurance, lab)';
COMMENT ON COLUMN public.patient_documents.storage_path IS 'Path to the file in Supabase Storage';
COMMENT ON COLUMN public.patient_documents.url IS 'Public URL to access the document';
COMMENT ON COLUMN public.patient_documents.notes IS 'Additional notes about the document';
COMMENT ON COLUMN public.patient_documents.status IS 'Status of the document (e.g., pending, verified, rejected)';

-- Add Row Level Security (RLS) policies
ALTER TABLE public.patient_documents ENABLE ROW LEVEL SECURITY;

-- Allow patients to see and upload their own documents only
CREATE POLICY "Patients can view their own documents" ON public.patient_documents 
  FOR SELECT USING (auth.uid()::uuid = patient_id);

CREATE POLICY "Patients can insert their own documents" ON public.patient_documents 
  FOR INSERT WITH CHECK (auth.uid()::uuid = patient_id);

CREATE POLICY "Patients can update their own documents" ON public.patient_documents 
  FOR UPDATE USING (auth.uid()::uuid = patient_id);

CREATE POLICY "Patients can delete their own documents" ON public.patient_documents 
  FOR DELETE USING (auth.uid()::uuid = patient_id);

-- Allow staff/admin access to all documents
CREATE POLICY "Staff can access all documents" ON public.patient_documents 
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role IN ('admin', 'provider', 'staff')
    )
  );

-- Create an index for faster lookup by patient_id
CREATE INDEX patient_documents_patient_id_idx ON public.patient_documents (patient_id);

-- Add table to publication for realtime updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.patient_documents;