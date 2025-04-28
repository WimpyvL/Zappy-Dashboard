-- Create storage bucket for patient documents if it doesn't exist
-- This needs to be executed by a superuser or storage admin

DO $$
BEGIN
  -- Check if the bucket already exists
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'patient-documents'
  ) THEN
    -- Create the bucket for patient documents
    INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
    VALUES (
      'patient-documents',
      'patient-documents',
      FALSE, -- Not public by default
      FALSE, -- No AVIF autodetection
      52428800, -- 50MB file size limit
      '{image/png,image/jpeg,image/gif,application/pdf,image/webp,image/heic,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document}'
    );
    
    -- Log success
    RAISE NOTICE 'Created patient-documents bucket';
  ELSE
    -- Log that it already exists
    RAISE NOTICE 'patient-documents bucket already exists';
  END IF;
END $$;

-- Set up RLS policies for the bucket
-- Allow patients to insert their own documents
CREATE POLICY "Patients can upload their own documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  -- Extract patient_id from the path
  auth.uid()::text = (regexp_match(name, '^([^/]+)/.*$'))[1]
  AND bucket_id = 'patient-documents'
);

-- Allow patients to view their own documents
CREATE POLICY "Patients can view their own documents"
ON storage.objects
FOR SELECT
USING (
  -- Extract patient_id from the path
  auth.uid()::text = (regexp_match(name, '^([^/]+)/.*$'))[1]
  AND bucket_id = 'patient-documents'
);

-- Allow patients to delete their own documents
CREATE POLICY "Patients can delete their own documents"
ON storage.objects
FOR DELETE
USING (
  -- Extract patient_id from the path
  auth.uid()::text = (regexp_match(name, '^([^/]+)/.*$'))[1]
  AND bucket_id = 'patient-documents'
);

-- Allow staff/admin access to all documents
CREATE POLICY "Staff and admin can access all documents"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'patient-documents'
  AND auth.uid() IN (
    SELECT id FROM auth.users
    WHERE raw_user_meta_data->>'role' IN ('admin', 'provider', 'staff')
  )
);