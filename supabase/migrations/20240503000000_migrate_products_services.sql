-- Migration script to consolidate products and services into the unified Products & Subscriptions management system
-- This script is part of the consolidation effort to bring all product-related entities under one umbrella

-- First, ensure we have the necessary categories for products
INSERT INTO categories (name, description, category_id, status, display_order, icon, show_in_marketplace, show_in_admin)
SELECT DISTINCT 
  category AS name, 
  'Migrated from products' AS description,
  LOWER(REGEXP_REPLACE(category, '[^a-zA-Z0-9]', '-', 'g')) AS category_id,
  'active' AS status,
  ROW_NUMBER() OVER (ORDER BY category) * 10 + 100 AS display_order,
  '' AS icon,
  TRUE AS show_in_marketplace,
  TRUE AS show_in_admin
FROM products
WHERE category IS NOT NULL AND category != ''
ON CONFLICT (category_id) DO NOTHING;

-- Add any missing categories from services
INSERT INTO categories (name, description, category_id, status, display_order, icon, show_in_marketplace, show_in_admin)
SELECT DISTINCT 
  'Service: ' || name AS name, 
  description AS description,
  'service-' || LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]', '-', 'g')) AS category_id,
  CASE WHEN active = true THEN 'active' ELSE 'inactive' END AS status,
  ROW_NUMBER() OVER (ORDER BY name) * 10 + 300 AS display_order,
  '' AS icon,
  TRUE AS show_in_marketplace,
  TRUE AS show_in_admin
FROM services
WHERE name IS NOT NULL AND name != ''
  AND NOT EXISTS (
    SELECT 1 FROM categories 
    WHERE category_id = 'service-' || LOWER(REGEXP_REPLACE(services.name, '[^a-zA-Z0-9]', '-', 'g'))
  );

-- Add metadata to products table to indicate they've been migrated
ALTER TABLE products ADD COLUMN IF NOT EXISTS migrated_to_unified BOOLEAN DEFAULT FALSE;

-- Mark all products as migrated
UPDATE products SET migrated_to_unified = TRUE;

-- Add metadata to services table to indicate they've been migrated
ALTER TABLE services ADD COLUMN IF NOT EXISTS migrated_to_unified BOOLEAN DEFAULT FALSE;

-- Mark all services as migrated
UPDATE services SET migrated_to_unified = TRUE;

-- Add comments to indicate that these tables are now managed through the unified system
COMMENT ON TABLE products IS 'DEPRECATED: Products are now managed through the unified Products & Subscriptions management system.';
COMMENT ON TABLE services IS 'DEPRECATED: Services are now managed through the unified Products & Subscriptions management system.';

-- Create a view that combines products and services for backward compatibility
CREATE OR REPLACE VIEW unified_products_services AS
SELECT 
  'product' AS entity_type,
  id,
  name,
  description,
  category,
  active,
  type,
  price,
  created_at,
  updated_at
FROM products
UNION ALL
SELECT 
  'service' AS entity_type,
  id,
  name,
  description,
  'service-' || LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]', '-', 'g')) AS category,
  active,
  'service' AS type,
  NULL AS price,
  created_at,
  updated_at
FROM services;

COMMENT ON VIEW unified_products_services IS 'This view combines products and services for backward compatibility. New code should use the unified Products & Subscriptions management system.';
