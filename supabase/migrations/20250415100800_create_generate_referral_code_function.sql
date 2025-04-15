-- Function to generate a random string of specified length
CREATE OR REPLACE FUNCTION generate_random_string(length integer)
RETURNS text AS $$
DECLARE
  chars text[] := '{0,1,2,3,4,5,6,7,8,9,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z}';
  result text := '';
  i integer := 0;
BEGIN
  IF length < 0 THEN
    raise exception 'Given length cannot be less than 0';
  END IF;
  FOR i IN 1..length LOOP
    result := result || chars[1+random()*(array_length(chars, 1)-1)];
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to generate a unique referral code for the profiles table
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS text AS $$
DECLARE
  new_code text;
  code_length integer := 8; -- Adjust length as needed
  max_attempts integer := 10;
  attempts integer := 0;
  code_exists boolean;
BEGIN
  LOOP
    new_code := generate_random_string(code_length);
    -- Check if the generated code already exists in the profiles table
    -- Ensure the 'profiles' table and 'referral_code' column exist before running this.
    SELECT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = new_code) INTO code_exists;

    IF NOT code_exists THEN
      RETURN new_code; -- Return the unique code
    END IF;

    attempts := attempts + 1;
    IF attempts >= max_attempts THEN
      RAISE EXCEPTION 'Could not generate a unique referral code after % attempts', max_attempts;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
