-- Migration to create the subscriptions table

CREATE TYPE subscription_status AS ENUM ('active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete', 'incomplete_expired', 'paused');

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE, -- Corrected reference to patients
  subscription_plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE RESTRICT, -- Prevent deleting plan if subscriptions exist
  status subscription_status NOT NULL DEFAULT 'active',
  -- Stripe specific IDs (nullable if using other providers or manual management)
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE, -- Subscription ID from Stripe
  stripe_price_id TEXT, -- Price ID used for this subscription
  -- Timestamps and Billing Info
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE, -- When the subscription fully ended (after grace period etc.)
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optional: Add comments
COMMENT ON TABLE public.subscriptions IS 'Stores patient subscription information, potentially linked to Stripe.';
COMMENT ON COLUMN public.subscriptions.patient_id IS 'Links to the patient record.';
COMMENT ON COLUMN public.subscriptions.subscription_plan_id IS 'Links to the chosen subscription plan.';
COMMENT ON COLUMN public.subscriptions.status IS 'Current status of the subscription (maps closely to Stripe statuses).';
COMMENT ON COLUMN public.subscriptions.stripe_subscription_id IS 'Unique subscription ID from Stripe.';

-- Enable Row Level Security (RLS)
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies:
-- 1. Allow users to read their own active/trialing subscription (using patients FK)
CREATE POLICY "Allow users to read own active subscription"
ON public.subscriptions
FOR SELECT USING (
    auth.uid() = patient_id AND status IN ('active', 'trialing', 'past_due', 'paused') 
    -- Assuming patient_id in subscriptions links to the user's ID in patients/auth.users
    -- This might need adjustment if patient_id is not the same as auth.uid()
);

-- 2. Allow admins to read all subscriptions
CREATE POLICY "Allow admins to read all subscriptions"
ON public.subscriptions
FOR SELECT USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
);

-- Note: Creating/Updating/Cancelling subscriptions should ideally be handled
-- via backend functions interacting with Stripe webhooks and APIs to keep
-- this table in sync with the payment provider. Direct manipulation from
-- the client is generally discouraged.

-- Add indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_subscriptions_patient_id ON public.subscriptions (patient_id); -- Index on the FK column
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions (status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON public.subscriptions (stripe_subscription_id);
