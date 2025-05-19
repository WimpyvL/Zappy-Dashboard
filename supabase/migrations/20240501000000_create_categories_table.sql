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

-- Sample categories can be added here if needed

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
