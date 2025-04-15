-- Ensure the updated_at trigger function exists
-- CREATE OR REPLACE FUNCTION trigger_set_timestamp()...

-- Create products table
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  name text NOT NULL,
  description text,
  sku text UNIQUE,
  price numeric(10, 2) NOT NULL CHECK (price >= 0),
  category text, -- Consider FK to a categories table if needed
  tags text[], -- Array of text tags
  image_url text, -- URL to product image (e.g., from Supabase Storage)
  stock_quantity integer CHECK (stock_quantity IS NULL OR stock_quantity >= 0),
  is_active boolean NOT NULL DEFAULT true,
  metadata jsonb -- For additional attributes like variants, dimensions, etc.
);

-- Add indexes
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_tags ON products USING GIN (tags); -- GIN index for array searching

-- Trigger to automatically update updated_at timestamp
CREATE TRIGGER set_products_timestamp
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow admins (or specific roles) to manage products
-- Replace 'admin_role_check()' with your actual role checking mechanism
CREATE POLICY "Allow admin management of products" ON products
  FOR ALL USING (auth.role() = 'service_role' /* OR admin_role_check() */)
  WITH CHECK (auth.role() = 'service_role' /* OR admin_role_check() */);

-- RLS Policy: Allow authenticated users to view active products
CREATE POLICY "Allow users to view active products" ON products
  FOR SELECT USING (is_active = true);

COMMENT ON TABLE products IS 'Stores information about products offered.';
COMMENT ON COLUMN products.sku IS 'Stock Keeping Unit - unique identifier for inventory.';
COMMENT ON COLUMN products.tags IS 'Array of tags for categorization and searching.';
COMMENT ON COLUMN products.stock_quantity IS 'Current inventory level.';
COMMENT ON COLUMN products.metadata IS 'JSON field for storing additional product attributes or variants.';
