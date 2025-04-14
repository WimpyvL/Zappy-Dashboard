-- Migration to create the public.profiles table

-- 1. Create the table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, -- Links to auth.users table
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'user', -- Example: Add a role column if needed
  -- Add other profile fields as needed, e.g., avatar_url, username, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add comments for clarity
COMMENT ON TABLE public.profiles IS 'Stores public profile information for users.';
COMMENT ON COLUMN public.profiles.id IS 'References the internal auth.users id.';
COMMENT ON COLUMN public.profiles.role IS 'User role for application-level permissions.';

-- 3. Enable Row Level Security (RLS)
-- Important: RLS is enabled by default on new tables in Supabase.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
-- Policy: Allow authenticated users to read all profiles
-- Adjust this policy based on your application's needs (e.g., only allow reading own profile, or specific roles reading others)
CREATE POLICY "Allow authenticated users to read profiles"
ON public.profiles
FOR SELECT
USING (auth.role() = 'authenticated');

-- Policy: Allow users to insert their own profile
CREATE POLICY "Allow users to insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Policy: Allow users to update their own profile
CREATE POLICY "Allow users to update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Note: You might need more specific policies depending on your access control requirements.
-- For example, an admin role might need broader update/delete permissions.

-- 5. (Optional but Recommended) Set up a trigger to automatically create a profile when a new user signs up in auth.users
-- Function to create a profile entry
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'firstName', -- Extract from metadata if available
    NEW.raw_user_meta_data ->> 'lastName',  -- Extract from metadata if available
    'user' -- Default role, adjust as needed
  );
  RETURN NEW;
END;
$$;

-- Trigger to call the function after a new user is inserted into auth.users
-- Conditionally create the trigger only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END
$$;

-- 6. Enable realtime for the new table if needed
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
