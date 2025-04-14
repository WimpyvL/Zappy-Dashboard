-- Migration to create the referrals table

CREATE TYPE referral_status AS ENUM ('pending', 'completed', 'rewarded', 'cancelled');

CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, -- User who referred
  referred_user_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE, -- User who was referred (unique to prevent multiple referrals)
  referral_code_used TEXT REFERENCES public.profiles(referral_code), -- Which code was used
  status referral_status NOT NULL DEFAULT 'pending', -- Status of the referral
  -- Timestamps for tracking progress
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- When the referred user signed up
  completed_at TIMESTAMP WITH TIME ZONE, -- When the referred user met reward conditions (e.g., first paid order)
  rewarded_at TIMESTAMP WITH TIME ZONE, -- When the reward was actually issued
  reward_amount DECIMAL(10, 2), -- Store the reward amount at the time of completion
  reward_recipient TEXT -- Store who was rewarded ('referrer', 'referee', 'both')
);

-- Optional: Add comments
COMMENT ON TABLE public.referrals IS 'Tracks individual referral events between users.';
COMMENT ON COLUMN public.referrals.referrer_user_id IS 'The user who made the referral.';
COMMENT ON COLUMN public.referrals.referred_user_id IS 'The new user who signed up using a referral code.';
COMMENT ON COLUMN public.referrals.status IS 'Tracks the progress of the referral towards reward eligibility.';

-- Enable Row Level Security (RLS)
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies:
-- 1. Allow users to read their own referrals (where they are the referrer)
CREATE POLICY "Allow users to read their own referrals made"
ON public.referrals
FOR SELECT USING (auth.uid() = referrer_user_id);

-- 2. Allow users to read the referral they signed up with (where they are the referee)
CREATE POLICY "Allow users to read the referral they used"
ON public.referrals
FOR SELECT USING (auth.uid() = referred_user_id);

-- 3. Allow admins to read all referrals
CREATE POLICY "Allow admins to read all referrals"
ON public.referrals
FOR SELECT USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
);

-- Note: Inserting/Updating referrals should likely be handled by backend functions/triggers
-- based on events like signup with code, first paid order, etc.
-- Direct client-side inserts/updates are generally not recommended for this table.

-- Add indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_user_id ON public.referrals (referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_user_id ON public.referrals (referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals (status);
CREATE INDEX IF NOT EXISTS idx_referrals_referral_code_used ON public.referrals (referral_code_used);
