-- Migration: Enhance Subscription Plans
-- Date: May 21, 2025

-- Add new fields to subscription_plans table
ALTER TABLE subscription_plans
ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS comparison_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS availability_rules JSONB DEFAULT '{"regions": [], "userGroups": [], "minAge": 0, "maxAge": 0}'::JSONB;

-- Create a function to ensure only one plan can be default per category
CREATE OR REPLACE FUNCTION ensure_single_default_plan_per_category()
RETURNS TRIGGER AS $$
BEGIN
  -- If the new/updated plan is set as default
  IF NEW.is_default = TRUE THEN
    -- Set is_default to FALSE for all other plans in the same category
    UPDATE subscription_plans
    SET is_default = FALSE
    WHERE category = NEW.category
      AND id != NEW.id
      AND is_default = TRUE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to enforce the single default plan per category rule
DROP TRIGGER IF EXISTS ensure_single_default_plan_trigger ON subscription_plans;
CREATE TRIGGER ensure_single_default_plan_trigger
BEFORE INSERT OR UPDATE OF is_default ON subscription_plans
FOR EACH ROW
WHEN (NEW.is_default = TRUE)
EXECUTE FUNCTION ensure_single_default_plan_per_category();

-- Add an index to improve performance when filtering by category
CREATE INDEX IF NOT EXISTS idx_subscription_plans_category ON subscription_plans(category);

-- Add an index for the comparison_order field to improve sorting performance
CREATE INDEX IF NOT EXISTS idx_subscription_plans_comparison_order ON subscription_plans(comparison_order);

-- Add a comment to the table to document the new fields
COMMENT ON COLUMN subscription_plans.is_default IS 'Indicates if this is the default recommended plan for its category';
COMMENT ON COLUMN subscription_plans.is_featured IS 'Indicates if this plan should be highlighted in comparisons';
COMMENT ON COLUMN subscription_plans.comparison_order IS 'Order in which plans should appear in comparison views (lower numbers first)';
COMMENT ON COLUMN subscription_plans.availability_rules IS 'Rules for plan availability (user groups, regions, age limits)';