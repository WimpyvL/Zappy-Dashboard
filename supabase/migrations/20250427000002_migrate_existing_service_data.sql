-- Data Migration Script for Service Management Feature
-- Date: April 27, 2025
-- Purpose: Migrate any existing service data to work with the new junction tables

-- This migration script should be run AFTER:
-- 1. 20250426000000_create_service_junction_tables.sql (creates junction tables)
-- 2. 20250427000000_add_column_descriptions.sql (adds column descriptions)
-- 3. 20250427000001_create_service_functions.sql (creates optimized functions)

BEGIN;

-- Set requires_consultation for existing services (default to true)
UPDATE services
SET requires_consultation = true
WHERE requires_consultation IS NULL;

-- Create a temporary table to store any product-service relationships that might exist
-- in legacy fields (if your original schema had these relationships stored differently)
CREATE TEMP TABLE temp_service_products AS
SELECT 
    s.id as service_id,
    p.id as product_id
FROM 
    services s
    CROSS JOIN LATERAL jsonb_array_elements_text(
        CASE 
            WHEN s.metadata IS NOT NULL AND s.metadata->'related_products' IS NOT NULL 
            THEN s.metadata->'related_products'
            ELSE '[]'::jsonb
        END
    ) as product_id_text
    JOIN products p ON p.id::text = product_id_text
ON CONFLICT DO NOTHING;

-- Create a temporary table to store any plan-service relationships that might exist
CREATE TEMP TABLE temp_service_plans AS
SELECT 
    s.id as service_id,
    sp.id as plan_id,
    COALESCE(
        (s.metadata->>'plan_duration'),
        '30 days'
    ) as duration,
    COALESCE(
        (s.metadata->>'requires_subscription')::boolean,
        true
    ) as requires_subscription
FROM 
    services s
    CROSS JOIN LATERAL jsonb_array_elements_text(
        CASE 
            WHEN s.metadata IS NOT NULL AND s.metadata->'subscription_plan_ids' IS NOT NULL 
            THEN s.metadata->'subscription_plan_ids'
            ELSE '[]'::jsonb
        END
    ) as plan_id_text
    JOIN subscription_plans sp ON sp.id::text = plan_id_text
ON CONFLICT DO NOTHING;

-- Insert legacy product relationships into the new junction table
INSERT INTO service_products (service_id, product_id)
SELECT service_id, product_id FROM temp_service_products
ON CONFLICT DO NOTHING;

-- Insert legacy plan relationships into the new junction table
INSERT INTO service_plans (service_id, plan_id, duration, requires_subscription)
SELECT service_id, plan_id, duration, requires_subscription FROM temp_service_plans
ON CONFLICT DO NOTHING;

-- Clean up temporary tables
DROP TABLE temp_service_products;
DROP TABLE temp_service_plans;

-- Check for any services that might have no relationships
DO $$
DECLARE
    services_without_products INTEGER;
    services_without_plans INTEGER;
BEGIN
    -- Count services without product relationships
    SELECT COUNT(*)
    INTO services_without_products
    FROM services s
    WHERE NOT EXISTS (
        SELECT 1 FROM service_products sp WHERE sp.service_id = s.id
    );
    
    -- Count services without plan relationships
    SELECT COUNT(*)
    INTO services_without_plans
    FROM services s
    WHERE NOT EXISTS (
        SELECT 1 FROM service_plans sp WHERE sp.service_id = s.id
    );

    -- Notify about services without relationships
    RAISE NOTICE 'Data migration completed: % services without product relationships, % services without plan relationships', 
        services_without_products, services_without_plans;
END $$;

COMMIT;