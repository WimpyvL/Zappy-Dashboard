-- Add missing pharmacy columns without dependencies
ALTER TABLE public.pharmacies
ADD COLUMN IF NOT EXISTS pharmacy_type TEXT,
ADD COLUMN IF NOT EXISTS contact_name TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS supported_states TEXT[];

-- Add comments for clarity
COMMENT ON COLUMN public.pharmacies.pharmacy_type IS 'Type of pharmacy (e.g., Compounding, Retail).';
COMMENT ON COLUMN public.pharmacies.contact_name IS 'Name of the primary contact person at the pharmacy.';
COMMENT ON COLUMN public.pharmacies.contact_phone IS 'Direct phone number for the pharmacy contact.';
COMMENT ON COLUMN public.pharmacies.supported_states IS 'Array of state codes where this pharmacy operates.';
