-- Create patient service enrollments table for modular service architecture
-- This migration adds support for patients to be enrolled in multiple services

-- Patient Service Enrollments table
CREATE TABLE IF NOT EXISTS patient_service_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES patient_subscription(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, paused, completed
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    settings JSONB DEFAULT '{}'::jsonb, -- Service-specific settings
    UNIQUE(patient_id, service_id)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_patient_service_enrollments_patient_id ON patient_service_enrollments(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_service_enrollments_service_id ON patient_service_enrollments(service_id);
CREATE INDEX IF NOT EXISTS idx_patient_service_enrollments_subscription_id ON patient_service_enrollments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_patient_service_enrollments_status ON patient_service_enrollments(status);

-- Create services table if it doesn't exist
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10, 2) DEFAULT 0,
    category VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add service_type column to services table if it doesn't exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'services') AND
       NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'service_type') THEN
        ALTER TABLE services ADD COLUMN service_type VARCHAR(100);
        
        -- Add comment explaining service_type
        COMMENT ON COLUMN services.service_type IS 'Identifies the type of service (e.g., hair-loss, weight-management, ed) for modular service architecture';
    END IF;
END $$;

-- Add features column to services table if it doesn't exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'services') AND
       NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'features') THEN
        ALTER TABLE services ADD COLUMN features JSONB DEFAULT '{}'::jsonb;
        
        -- Add comment explaining features
        COMMENT ON COLUMN services.features IS 'JSON object containing service-specific features and configuration';
    END IF;
END $$;

-- Add resource_categories column to services table if it doesn't exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'services') AND
       NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'resource_categories') THEN
        ALTER TABLE services ADD COLUMN resource_categories TEXT[] DEFAULT '{}';
        
        -- Add comment explaining resource_categories
        COMMENT ON COLUMN services.resource_categories IS 'Array of category IDs for educational resources related to this service';
    END IF;
END $$;

-- Add product_categories column to services table if it doesn't exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'services') AND
       NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'product_categories') THEN
        ALTER TABLE services ADD COLUMN product_categories TEXT[] DEFAULT '{}';
        
        -- Add comment explaining product_categories
        COMMENT ON COLUMN services.product_categories IS 'Array of category IDs for products related to this service';
    END IF;
END $$;

-- Insert sample services if they don't exist
INSERT INTO services (name, description, price, category, service_type, features, resource_categories, product_categories)
VALUES
    (
        'Hair Loss Treatment', 
        'Personalized hair loss prevention program', 
        0, 
        'hair', 
        'hair-loss',
        '{
            "medications": ["finasteride", "minoxidil"],
            "supplements": ["biotin"],
            "icon": "scissors"
        }',
        ARRAY['hair'],
        ARRAY['hair', 'supplements']
    ),
    (
        'Weight Management', 
        'Personalized weight loss program', 
        0, 
        'weight-management', 
        'weight-management',
        '{
            "medications": ["semaglutide"],
            "supplements": ["multivitamin"],
            "icon": "scale"
        }',
        ARRAY['weight-management', 'nutrition'],
        ARRAY['weight-management', 'supplements']
    ),
    (
        'ED Treatment', 
        'Personalized ED management program', 
        0, 
        'ed', 
        'ed',
        '{
            "medications": ["sildenafil", "tadalafil"],
            "icon": "pill"
        }',
        ARRAY['ed'],
        ARRAY['ed', 'supplements']
    )
ON CONFLICT (name) DO UPDATE 
SET 
    service_type = EXCLUDED.service_type,
    features = EXCLUDED.features,
    resource_categories = EXCLUDED.resource_categories,
    product_categories = EXCLUDED.product_categories
WHERE 
    services.service_type IS NULL;

-- Add service_ids array to subscription_plans table if it doesn't exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscription_plans') AND
       NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_plans' AND column_name = 'service_ids') THEN
        ALTER TABLE subscription_plans ADD COLUMN service_ids UUID[] DEFAULT '{}';
        
        -- Add comment explaining service_ids
        COMMENT ON COLUMN subscription_plans.service_ids IS 'Array of service IDs included in this subscription plan';
    END IF;
END $$;

-- Update existing subscription plans to include services (if any exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscription_plans') THEN
        UPDATE subscription_plans sp
        SET service_ids = ARRAY(
            SELECT id FROM services 
            WHERE category = sp.category
        )
        WHERE service_ids IS NULL OR service_ids = '{}';
    END IF;
END $$;
