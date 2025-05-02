-- Add duration_days column to subscription_duration table
ALTER TABLE subscription_duration ADD COLUMN IF NOT EXISTS duration_days INTEGER;

-- Update existing Monthly duration to use 28 days
UPDATE subscription_duration 
SET 
  name = 'Monthly (28 days)',
  duration_days = 28
WHERE 
  name = 'Monthly' 
  OR name ILIKE '%month%' 
  AND duration_months = 1;

-- Add comment to explain the purpose of the column
COMMENT ON COLUMN subscription_duration.duration_days IS 'Optional field for exact day-based durations (e.g., 28 days). When set, this takes precedence over duration_months for calculating subscription end dates.';
