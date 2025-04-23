-- Migration to ensure the profiles table has a role column
DO $$
BEGIN
  -- Check if profiles table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
    -- Check if role column exists
    IF NOT EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_name = 'profiles' 
        AND column_name = 'role'
        AND table_schema = 'public'
    ) THEN
      -- Add the role column if it doesn't exist
      ALTER TABLE public.profiles 
      ADD COLUMN role TEXT DEFAULT 'patient';
      
      -- Add comment for the column
      COMMENT ON COLUMN public.profiles.role IS 'User role within the application.';
    END IF;
  ELSE
    -- Create the entire profiles table if it doesn't exist
    CREATE TABLE public.profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      first_name TEXT,
      last_name TEXT,
      role TEXT DEFAULT 'patient',
      referral_code TEXT UNIQUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Add comments
    COMMENT ON TABLE public.profiles IS 'Stores public profile information linked to authenticated users.';
    COMMENT ON COLUMN public.profiles.id IS 'Links to auth.users table.';
    COMMENT ON COLUMN public.profiles.role IS 'User role within the application.';
    COMMENT ON COLUMN public.profiles.referral_code IS 'Unique code used for referrals.';

    -- Create helper function to check admin role
    CREATE OR REPLACE FUNCTION public.is_admin()
    RETURNS boolean AS $$
      SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
      );
    $$ LANGUAGE sql SECURITY DEFINER;

    -- Enable Row Level Security
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

    -- Create RLS policies
    CREATE POLICY "Allow users to read own profile"
    ON public.profiles
    FOR SELECT USING (auth.uid() = id);

    CREATE POLICY "Allow users to update own profile"
    ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

    CREATE POLICY "Allow admin read access on profiles" 
    ON public.profiles
    FOR SELECT USING (public.is_admin());

    -- Create function to generate referral codes
    CREATE OR REPLACE FUNCTION public.generate_referral_code()
    RETURNS TEXT AS $$
    DECLARE
      new_code TEXT;
      found BOOLEAN;
    BEGIN
      LOOP
        new_code := upper(substr(md5(random()::text), 1, 8));
        SELECT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = new_code) INTO found;
        EXIT WHEN NOT found;
      END LOOP;
      RETURN new_code;
    END;
    $$ LANGUAGE plpgsql VOLATILE;

    -- Create trigger function for new users
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO public.profiles (id, first_name, last_name, referral_code)
      VALUES (
        NEW.id,
        NEW.raw_user_meta_data ->> 'first_name',
        NEW.raw_user_meta_data ->> 'last_name',
        public.generate_referral_code()
      );
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Create the trigger
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;
