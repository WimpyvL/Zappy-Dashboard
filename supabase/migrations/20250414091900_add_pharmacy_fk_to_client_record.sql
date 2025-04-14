-- Add preferred_pharmacy_id column to client_record table

ALTER TABLE public.client_record
ADD COLUMN preferred_pharmacy_id UUID NULL; -- Allow NULL initially

-- Add foreign key constraint to link to pharmacies table
-- Make sure the pharmacies table exists before running this
ALTER TABLE public.client_record
ADD CONSTRAINT fk_client_record_preferred_pharmacy
FOREIGN KEY (preferred_pharmacy_id)
REFERENCES public.pharmacies(id)
ON DELETE SET NULL; -- Set to NULL if pharmacy is deleted

-- Add comment
COMMENT ON COLUMN public.client_record.preferred_pharmacy_id IS 'Foreign key referencing the patient''s preferred pharmacy.';
