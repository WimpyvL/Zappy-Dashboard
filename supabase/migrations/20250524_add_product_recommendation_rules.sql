-- Create product recommendation rules table
CREATE TABLE IF NOT EXISTS product_recommendation_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  condition_type VARCHAR(50) NOT NULL, -- 'bmi', 'goal', 'condition', 'age', 'combination'
  condition_value JSONB NOT NULL, -- Stores the condition logic
  priority INTEGER NOT NULL, -- Higher number = higher priority
  product_title VARCHAR(255) NOT NULL,
  product_description TEXT NOT NULL,
  reason_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups by priority
CREATE INDEX IF NOT EXISTS idx_recommendation_rules_priority ON product_recommendation_rules(priority DESC);

-- Add sample rules
INSERT INTO product_recommendation_rules (
  name, 
  description, 
  condition_type, 
  condition_value, 
  priority, 
  product_title, 
  product_description, 
  reason_text
) VALUES 
(
  'Overweight BMI Rule',
  'Recommends weight management bundle for patients with BMI over 25',
  'bmi',
  '{"operator": "gt", "value": 25}',
  100,
  'Weight Management Bundle',
  'Includes GLP-1 medication, nutrition coaching, and progress tracking.',
  'Based on your BMI, our weight management program could help you reach your health goals'
),
(
  'Heart Health Rule',
  'Recommends heart health bundle for patients with hypertension',
  'condition',
  '{"operator": "includes", "value": "hypertension"}',
  90,
  'Heart Health Bundle',
  'Includes blood pressure monitoring, medication management, and lifestyle coaching.',
  'This bundle is designed to support your heart health needs'
),
(
  'Energy Boost Rule',
  'Recommends energy bundle for patients with energy goals',
  'goal',
  '{"operator": "includes", "value": "energy"}',
  80,
  'Energy Boost Bundle',
  'Includes vitamin B complex, iron supplements, and sleep improvement coaching.',
  'This bundle is designed to help with your energy goals'
);

-- Create trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_recommendation_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_recommendation_rules_updated_at
BEFORE UPDATE ON product_recommendation_rules
FOR EACH ROW
EXECUTE FUNCTION update_recommendation_rules_updated_at();
