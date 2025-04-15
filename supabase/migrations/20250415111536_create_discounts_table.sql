-- Ensure the updated_at trigger function exists (created in patients migration)
-- CREATE OR REPLACE FUNCTION trigger_set_timestamp()... (if not already created)

-- Create discounts table
CREATE TABLE discounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  code text UNIQUE NOT NULL,
  description text,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  value numeric NOT NULL CHECK (value >= 0), -- Ensure value is non-negative
  is_active boolean NOT NULL DEFAULT true,
  valid_from timestamptz,
  valid_until timestamptz,
  usage_limit integer CHECK (usage_limit IS NULL OR usage_limit >= 0),
  usage_count integer NOT NULL DEFAULT 0 CHECK (usage_count >= 0),

  -- Constraint to ensure valid_until is after valid_from if both are set
  CONSTRAINT valid_dates CHECK (valid_from IS NULL OR valid_until IS NULL OR valid_until > valid_from),
  -- Constraint to ensure usage_count does not exceed usage_limit
  CONSTRAINT usage_limit_check CHECK (usage_limit IS NULL OR usage_count <= usage_limit)
);

-- Add indexes
CREATE INDEX idx_discounts_code ON discounts(code);
CREATE INDEX idx_discounts_is_active ON discounts(is_active);
CREATE INDEX idx_discounts_valid_dates ON discounts(valid_from, valid_until);

-- Trigger to automatically update updated_at timestamp
CREATE TRIGGER set_discounts_timestamp
BEFORE UPDATE ON discounts
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Enable Row Level Security (RLS)
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow admins (or specific roles) to manage discounts
-- Replace 'admin_role_check()' with your actual role checking mechanism
CREATE POLICY "Allow admin management of discounts" ON discounts
  FOR ALL USING (auth.role() = 'service_role' /* OR admin_role_check() */)
  WITH CHECK (auth.role() = 'service_role' /* OR admin_role_check() */);

-- RLS Policy: Allow authenticated users to view active and valid discounts
-- This might need refinement based on how discounts are applied (e.g., user-specific?)
CREATE POLICY "Allow users to view valid discounts" ON discounts
  FOR SELECT USING (
    is_active = true AND
    (valid_from IS NULL OR valid_from <= now()) AND
    (valid_until IS NULL OR valid_until >= now()) AND
    (usage_limit IS NULL OR usage_count < usage_limit)
  );

COMMENT ON TABLE discounts IS 'Stores discount codes and their properties.';
COMMENT ON COLUMN discounts.code IS 'The unique code entered by users to apply the discount.';
COMMENT ON COLUMN discounts.discount_type IS 'Type of discount: percentage or fixed_amount.';
COMMENT ON COLUMN discounts.value IS 'The numeric value of the discount (percentage or amount).';
COMMENT ON COLUMN discounts.is_active IS 'Whether the discount code is currently active.';
COMMENT ON COLUMN discounts.valid_until IS 'The date and time when the discount expires.';
COMMENT ON COLUMN discounts.usage_limit IS 'Maximum number of times the discount can be used.';
COMMENT ON COLUMN discounts.usage_count IS 'Number of times the discount has been used.';
