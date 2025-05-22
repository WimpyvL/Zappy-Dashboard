-- Create subscription_durations table
CREATE TABLE IF NOT EXISTS subscription_durations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    duration_months INTEGER NOT NULL DEFAULT 1,
    duration_days INTEGER,
    discount_percent DECIMAL(5, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index on name for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscription_durations_name ON subscription_durations(name);

-- Add some default durations
INSERT INTO subscription_durations (name, duration_months, duration_days, discount_percent)
VALUES 
    ('Monthly', 1, NULL, 0),
    ('Quarterly', 3, NULL, 5),
    ('Semi-Annual', 6, NULL, 10),
    ('Annual', 12, NULL, 15)
ON CONFLICT (name) DO NOTHING;

-- Add function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_subscription_durations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to automatically update updated_at on row update
DROP TRIGGER IF EXISTS update_subscription_durations_updated_at ON subscription_durations;
CREATE TRIGGER update_subscription_durations_updated_at
BEFORE UPDATE ON subscription_durations
FOR EACH ROW
EXECUTE FUNCTION update_subscription_durations_updated_at();

-- Add foreign key to subscription_plans table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'subscription_plans') THEN
        -- Check if the column already exists
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_name = 'subscription_plans' AND column_name = 'duration_id') THEN
            -- Add the column
            ALTER TABLE subscription_plans ADD COLUMN duration_id INTEGER;
            
            -- Add the foreign key constraint
            ALTER TABLE subscription_plans 
            ADD CONSTRAINT fk_subscription_plans_duration 
            FOREIGN KEY (duration_id) 
            REFERENCES subscription_durations(id) 
            ON DELETE SET NULL;
        END IF;
    END IF;
END
$$;
