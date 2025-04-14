-- Migration to create the profiles table linked to auth.users

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, -- Matches auth.users id and cascades deletes
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'patient', -- Example: 'patient', 'admin', 'provider'
  referral_code TEXT UNIQUE, -- Unique referral code for each user
  -- Add other profile-specific columns as needed (e.g., avatar_url, timezone)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optional: Add comments
COMMENT ON TABLE public.profiles IS 'Stores public profile information linked to authenticated users.';
COMMENT ON COLUMN public.profiles.id IS 'Links to auth.users table.';
COMMENT ON COLUMN public.profiles.role IS 'User role within the application.';
COMMENT ON COLUMN public.profiles.referral_code IS 'Unique code used for referrals.';

-- Helper function to check if the current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies:
-- Drop existing policies first to ensure clean application
DROP POLICY IF EXISTS "Allow users to read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin read access on profiles" ON public.profiles;

-- 1. Allow users to read their own profile
CREATE POLICY "Allow users to read own profile"
ON public.profiles
FOR SELECT USING (auth.uid() = id);

-- 2. Allow users to update their own profile (first_name, last_name)
CREATE POLICY "Allow users to update own profile"
ON public.profiles
FOR UPDATE USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 3. Allow admins to read all profiles (using helper function)
CREATE POLICY "Allow admin read access on profiles" ON public.profiles
  FOR SELECT USING (is_admin()); -- Use the helper function

-- Function to generate a unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  found BOOLEAN;
BEGIN
  LOOP
    -- Generate a random 8-character alphanumeric code
    new_code := upper(substr(md5(random()::text), 1, 8));
    -- Check if it already exists
    SELECT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = new_code) INTO found;
    -- Exit loop if unique
    EXIT WHEN NOT found;
  END LOOP;
  RETURN new_code;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Function to automatically create a profile when a new user signs up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, referral_code)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name', -- Get from metadata if provided during signup
    NEW.raw_user_meta_data ->> 'last_name',  -- Get from metadata if provided during signup
    generate_referral_code() -- Generate a unique referral code
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function after a new user is inserted into auth.users
-- Drop trigger first if it exists to avoid conflicts during re-runs
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Optional: Function to update profile names when auth user metadata changes
-- CREATE OR REPLACE FUNCTION public.handle_user_update()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   UPDATE public.profiles
--   SET
--     first_name = NEW.raw_user_meta_data ->> 'first_name',
--     last_name = NEW.raw_user_meta_data ->> 'last_name'
--   WHERE id = NEW.id;
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

-- CREATE TRIGGER on_auth_user_updated
--   AFTER UPDATE OF raw_user_meta_data ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();
