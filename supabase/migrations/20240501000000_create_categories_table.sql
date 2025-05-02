-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    display_order INTEGER NOT NULL DEFAULT 0,
    icon VARCHAR(100),
    show_in_marketplace BOOLEAN NOT NULL DEFAULT TRUE,
    show_in_admin BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on category_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_categories_category_id ON categories(category_id);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_categories_status ON categories(status);

-- Insert default categories
INSERT INTO categories (name, description, category_id, status, display_order, icon, show_in_marketplace, show_in_admin)
VALUES
    ('Hair', 'Products and services for hair loss and hair care', 'hair', 'active', 10, 'hair', TRUE, TRUE),
    ('ED', 'Products and services for erectile dysfunction', 'ed', 'active', 20, 'pill', TRUE, TRUE),
    ('Weight Management', 'Products and services for weight management', 'weight-management', 'active', 30, 'scale', TRUE, TRUE),
    ('Skin', 'Skincare products and treatments', 'skin', 'active', 40, 'skin', TRUE, TRUE),
    ('Mental Health', 'Mental health services and medications', 'mental-health', 'active', 50, 'brain', TRUE, TRUE),
    ('General Health', 'General health products and services', 'general-health', 'active', 60, '', TRUE, TRUE),
    ('Supplements', 'Nutritional supplements', 'supplements', 'active', 70, 'pill', TRUE, TRUE),
    ('Nutrition', 'Nutrition products and services', 'nutrition', 'active', 80, 'food', TRUE, TRUE),
    ('Devices', 'Medical and health devices', 'devices', 'active', 90, 'device', TRUE, TRUE),
    ('Diagnostics', 'Diagnostic tests and services', 'diagnostics', 'active', 100, 'test', TRUE, TRUE),
    ('Family', 'Family health products and services', 'family', 'active', 110, 'family', TRUE, TRUE),
    ('Premium', 'Premium health products and services', 'premium', 'active', 120, 'star', TRUE, TRUE),
    ('Standard', 'Standard health products and services', 'standard', 'active', 130, '', TRUE, TRUE),
    ('Supplies', 'Medical and health supplies', 'supplies', 'active', 140, 'box', TRUE, TRUE)
ON CONFLICT (category_id) DO NOTHING;

-- Add column to products table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'category') THEN
        ALTER TABLE products ADD COLUMN category VARCHAR(100) REFERENCES categories(category_id);
    END IF;
END $$;

-- Add column to subscription_plans table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscription_plans' AND column_name = 'category') THEN
        ALTER TABLE subscription_plans ADD COLUMN category VARCHAR(100) REFERENCES categories(category_id);
    END IF;
END $$;

-- Add column to services table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'services' AND column_name = 'category') THEN
        ALTER TABLE services ADD COLUMN category VARCHAR(100) REFERENCES categories(category_id);
    END IF;
END $$;

-- Add column to bundles table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bundles' AND column_name = 'category') THEN
        ALTER TABLE bundles ADD COLUMN category VARCHAR(100) REFERENCES categories(category_id);
    END IF;
END $$;
