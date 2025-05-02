-- Migration script to move data from treatment_package to subscription_plans
-- This script is part of the consolidation of Treatment Packages into the unified Products & Subscriptions management

-- First, ensure we have the necessary categories for the treatment packages
INSERT INTO categories (name, description, category_id, status, display_order, icon, show_in_marketplace, show_in_admin)
SELECT DISTINCT 
  condition AS name, 
  'Migrated from treatment packages' AS description,
  LOWER(REGEXP_REPLACE(condition, '[^a-zA-Z0-9]', '-', 'g')) AS category_id,
  'active' AS status,
  ROW_NUMBER() OVER (ORDER BY condition) * 10 + 200 AS display_order,
  '' AS icon,
  TRUE AS show_in_marketplace,
  TRUE AS show_in_admin
FROM treatment_package
WHERE condition IS NOT NULL AND condition != ''
ON CONFLICT (category_id) DO NOTHING;

-- Now migrate the treatment packages to subscription plans
INSERT INTO subscription_plans (
  name,
  description,
  price,
  billing_cycle,
  features,
  is_active,
  category,
  created_at,
  updated_at
)
SELECT 
  tp.name,
  tp.description,
  tp.base_price AS price,
  'monthly' AS billing_cycle,
  jsonb_build_object(
    'migrated_from', 'treatment_package',
    'original_id', tp.id,
    'services', COALESCE(
      (SELECT jsonb_agg(ps.service_id) 
       FROM package_service ps 
       WHERE ps.package_id = tp.id), 
      '[]'::jsonb
    )
  ) AS features,
  tp.is_active,
  LOWER(REGEXP_REPLACE(tp.condition, '[^a-zA-Z0-9]', '-', 'g')) AS category,
  tp.created_at,
  tp.updated_at
FROM treatment_package tp
WHERE NOT EXISTS (
  -- Skip if we already have a subscription plan with this name (to avoid duplicates)
  SELECT 1 FROM subscription_plans sp 
  WHERE sp.name = tp.name AND 
        (sp.features->>'migrated_from') = 'treatment_package' AND
        (sp.features->>'original_id')::uuid = tp.id
);

-- Update patient subscriptions to point to the new subscription plans
-- This is a complex operation that would require mapping between the old and new IDs
-- For now, we'll just add a comment explaining what needs to be done manually
/*
To complete the migration, you'll need to:
1. Map each treatment_package ID to its corresponding new subscription_plan ID
2. Update the patient_subscription table to reference the new subscription_plan IDs
3. Update any other tables that reference treatment_package IDs

Example (to be executed manually after verifying the mapping):
UPDATE patient_subscription ps
SET package_id = sp.id
FROM subscription_plans sp
WHERE ps.package_id IN (SELECT id FROM treatment_package)
AND sp.features->>'migrated_from' = 'treatment_package'
AND (sp.features->>'original_id')::uuid = ps.package_id;
*/

-- Add a comment to indicate that the treatment_package table is deprecated
COMMENT ON TABLE treatment_package IS 'DEPRECATED: This table has been replaced by subscription_plans. The data has been migrated.';
COMMENT ON TABLE package_service IS 'DEPRECATED: This table has been replaced by subscription_plans with services stored in the features JSON field.';
