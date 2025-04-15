-- Add missing columns to pharmacies table based on frontend usage

ALTER TABLE public.pharmacies
ADD COLUMN IF NOT EXISTS pharmacy_type TEXT,
ADD COLUMN IF NOT EXISTS contact_name TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT;

-- Add comments for clarity
COMMENT ON COLUMN public.pharmacies.pharmacy_type IS 'Type of pharmacy (e.g., Compounding, Retail).';
COMMENT ON COLUMN public.pharmacies.contact_name IS 'Name of the primary contact person at the pharmacy.';
COMMENT ON COLUMN public.pharmacies.contact_phone IS 'Direct phone number for the pharmacy contact.';

-- Note: supported_states was handled in the hooks by mapping to a non-existent column.
-- If state support needs to be stored, a separate migration adding a 'supported_states TEXT[]' column is required.
-- For now, this migration only adds columns directly used in the form state that were missing.
