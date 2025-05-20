-- Migration to update products table to include medication-specific fields
-- This creates a unified data model where products can be medications

-- 1. Add new fields to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS requires_prescription BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS default_frequency TEXT,
ADD COLUMN IF NOT EXISTS dosages JSONB,
ADD COLUMN IF NOT EXISTS instructions TEXT[],
ADD COLUMN IF NOT EXISTS default_approach TEXT,
ADD COLUMN IF NOT EXISTS supported_approaches TEXT[];

-- 2. Create migration function to move data from medications to products
CREATE OR REPLACE FUNCTION migrate_medications_to_products()
RETURNS void AS $$
DECLARE
  med RECORD;
BEGIN
  FOR med IN SELECT * FROM medications LOOP
    -- Update corresponding product with medication data
    UPDATE products
    SET 
      requires_prescription = TRUE,
      default_frequency = med.default_frequency,
      dosages = med.dosages,
      instructions = med.instructions,
      default_approach = med.default_approach,
      supported_approaches = med.supported_approaches
    WHERE id = med.product_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 3. Execute the migration function
SELECT migrate_medications_to_products();

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_prescription ON products(requires_prescription);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);

-- 5. Create a view for backward compatibility
CREATE OR REPLACE VIEW medications_view AS
SELECT 
  p.id,
  p.name,
  p.brand_name,
  p.category_id,
  p.default_frequency,
  p.dosages,
  p.instructions,
  p.default_approach,
  p.supported_approaches
FROM products p
WHERE p.requires_prescription = TRUE;

-- 6. Add comment to document the migration
COMMENT ON TABLE products IS 'Products table with unified medication fields. Products with requires_prescription=TRUE are medications.';
