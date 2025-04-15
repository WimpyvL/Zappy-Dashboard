-- Add supported_states column to pharmacies table

ALTER TABLE public.pharmacies
ADD COLUMN IF NOT EXISTS supported_states TEXT[];

-- Add comment for clarity
COMMENT ON COLUMN public.pharmacies.supported_states IS 'Array of state codes (e.g., CA, TX) that the pharmacy serves.';
