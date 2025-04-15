-- Ensure the updated_at trigger function exists
-- CREATE OR REPLACE FUNCTION trigger_set_timestamp()...

-- Create subscription_plans table
CREATE TABLE subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  name text UNIQUE NOT NULL,
  description text,
  billing_frequency text NOT NULL CHECK (billing_frequency IN ('monthly', 'quarterly', 'biannually', 'annually')),
  delivery_frequency text NOT NULL CHECK (delivery_frequency IN ('weekly', 'biweekly', 'monthly', 'bimonthly')),
  price numeric(10, 2) NOT NULL CHECK (price >= 0),
  discount numeric(5, 2) DEFAULT 0.00 CHECK (discount >= 0 AND discount <= 100),
  category text,
  popularity text CHECK (popularity IN ('low', 'medium', 'high')),
  requires_consultation boolean DEFAULT true,
  additional_benefits text[], -- Array of text benefits
  allowed_product_doses jsonb DEFAULT '[]'::jsonb, -- Array: [{ "product_id": "uuid", "dose_value": "text" }]
  is_active boolean NOT NULL DEFAULT true
);

-- Add indexes
CREATE INDEX idx_subscription_plans_name ON subscription_plans(name);
CREATE INDEX idx_subscription_plans_category ON subscription_plans(category);
CREATE INDEX idx_subscription_plans_is_active ON subscription_plans(is_active);
-- GIN index for searching within the allowed_product_doses JSONB array
CREATE INDEX idx_subscription_plans_allowed_doses ON subscription_plans USING GIN (allowed_product_doses);

-- Trigger to automatically update updated_at timestamp
CREATE TRIGGER set_subscription_plans_timestamp
BEFORE UPDATE ON subscription_plans
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Enable Row Level Security (RLS)
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow admins (or specific roles) to manage subscription plans
CREATE POLICY "Allow admin management of subscription plans" ON subscription_plans
  FOR ALL USING (auth.role() = 'service_role' /* OR admin_role_check() */)
  WITH CHECK (auth.role() = 'service_role' /* OR admin_role_check() */);

-- RLS Policy: Allow authenticated users to view active subscription plans
CREATE POLICY "Allow users to view active subscription plans" ON subscription_plans
  FOR SELECT USING (is_active = true);

COMMENT ON TABLE subscription_plans IS 'Stores details about available subscription plans.';
COMMENT ON COLUMN subscription_plans.allowed_product_doses IS 'JSON array specifying which product doses are included/allowed in this plan.';
COMMENT ON COLUMN subscription_plans.billing_frequency IS 'How often the subscription is billed.';
COMMENT ON COLUMN subscription_plans.delivery_frequency IS 'How often products are delivered/shipped.';
COMMENT ON COLUMN subscription_plans.is_active IS 'Whether this plan is currently available for new subscriptions.';
