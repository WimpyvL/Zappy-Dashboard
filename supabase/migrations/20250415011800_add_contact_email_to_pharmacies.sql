-- Add contact_email column to pharmacies table
ALTER TABLE public.pharmacies
ADD COLUMN contact_email TEXT;

-- Optional: Add a comment to the column
COMMENT ON COLUMN public.pharmacies.contact_email IS 'Specific contact email address for the pharmacy, potentially different from the general email.';
