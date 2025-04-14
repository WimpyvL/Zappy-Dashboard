-- Migration to create the referral_settings table

CREATE TABLE IF NOT EXISTS public.referral_settings (
  id INT PRIMARY KEY DEFAULT 1, -- Use a fixed ID for the single settings row
  reward_amount DECIMAL(10, 2) NOT NULL DEFAULT 5.00, -- Default reward amount
  reward_recipient TEXT NOT NULL DEFAULT 'referrer' CHECK (reward_recipient IN ('referrer', 'referee', 'both')), -- Who gets the reward
  -- Add other settings like minimum order value for reward, etc. if needed
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT single_row_check CHECK (id = 1) -- Ensure only one row can exist
);

-- Optional: Add comments
COMMENT ON TABLE public.referral_settings IS 'Stores global settings for the referral program.';
COMMENT ON COLUMN public.referral_settings.reward_amount IS 'The monetary value awarded per successful referral.';
COMMENT ON COLUMN public.referral_settings.reward_recipient IS 'Determines who receives the reward: referrer, referee, or both.';

-- Enable Row Level Security (RLS)
ALTER TABLE public.referral_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies:
-- 1. Allow authenticated users to read the settings
CREATE POLICY "Allow authenticated read access to referral settings"
ON public.referral_settings
FOR SELECT
TO authenticated
USING (true);

-- 2. Allow only admins (or a specific role) to update the settings
--    Requires a way to identify admins, e.g., a 'role' column in 'profiles' table
--    or a custom function like 'is_admin()'. Assuming 'profiles.role' exists.
CREATE POLICY "Allow admins to update referral settings"
ON public.referral_settings
FOR UPDATE
USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
)
WITH CHECK (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
);

-- Insert default settings row if it doesn't exist
INSERT INTO public.referral_settings (id, reward_amount, reward_recipient)
VALUES (1, 5.00, 'referrer')
ON CONFLICT (id) DO NOTHING;
