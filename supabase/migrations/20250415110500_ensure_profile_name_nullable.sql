-- Migration to ensure first_name and last_name in profiles table are nullable

-- Addresses potential schema drift where these columns might have been
-- incorrectly set to NOT NULL without a default value, potentially causing
-- the handle_new_user trigger to fail during signup if names are not provided.

-- Attempt to remove the NOT NULL constraint if it exists.
-- If the column is already nullable, this command might do nothing or
-- potentially raise a notice/warning depending on the environment, but it
-- ensures the column ends up in the desired nullable state.

ALTER TABLE public.profiles
ALTER COLUMN first_name DROP NOT NULL;

ALTER TABLE public.profiles
ALTER COLUMN last_name DROP NOT NULL;

-- Add comments for clarity
COMMENT ON COLUMN public.profiles.first_name IS 'User''s first name (nullable).';
COMMENT ON COLUMN public.profiles.last_name IS 'User''s last name (nullable).';
