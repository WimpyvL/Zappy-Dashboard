-- Add prior authorization fields to insurance_policy table
ALTER TABLE insurance_policy
ADD COLUMN IF NOT EXISTS coverage_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS coverage_details TEXT,
ADD COLUMN IF NOT EXISTS prior_auth_status VARCHAR(50),
ADD COLUMN IF NOT EXISTS prior_auth_expiry_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS prior_auth_reference VARCHAR(100),
ADD COLUMN IF NOT EXISTS verification_history JSONB;

-- Add comment to explain the verification_history column
COMMENT ON COLUMN insurance_policy.verification_history IS 'JSON array of verification log entries with status, timestamp, user, and notes';

-- Create index on prior_auth_status for faster filtering
CREATE INDEX IF NOT EXISTS idx_insurance_prior_auth_status ON insurance_policy(prior_auth_status);

-- Create index on prior_auth_expiry_date for faster expiration queries
CREATE INDEX IF NOT EXISTS idx_insurance_prior_auth_expiry ON insurance_policy(prior_auth_expiry_date);
