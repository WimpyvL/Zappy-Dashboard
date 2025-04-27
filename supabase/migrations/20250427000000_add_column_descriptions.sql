-- Add Column Descriptions for Service Management Tables
-- This migration adds descriptive comments to tables and columns for better documentation
-- Date: April 27, 2025

-- Services table description
COMMENT ON TABLE services IS 'Healthcare services offered through the platform';
COMMENT ON COLUMN services.id IS 'Unique identifier for the service';
COMMENT ON COLUMN services.name IS 'Name of the service';
COMMENT ON COLUMN services.description IS 'Detailed description of the service';
COMMENT ON COLUMN services.price IS 'Base price of the service in USD';
COMMENT ON COLUMN services.duration_minutes IS 'Duration of the service in minutes';
COMMENT ON COLUMN services.category IS 'Service category (e.g., General, Mental Health, Nutrition)';
COMMENT ON COLUMN services.is_active IS 'Whether the service is currently active and available';
COMMENT ON COLUMN services.requires_consultation IS 'Whether the service requires an initial consultation';
COMMENT ON COLUMN services.created_at IS 'Timestamp when the service was created';
COMMENT ON COLUMN services.updated_at IS 'Timestamp when the service was last updated';

-- Service Products junction table description
COMMENT ON TABLE service_products IS 'Junction table linking services with related products';
COMMENT ON COLUMN service_products.id IS 'Unique identifier for the service-product relationship';
COMMENT ON COLUMN service_products.service_id IS 'Reference to the service';
COMMENT ON COLUMN service_products.product_id IS 'Reference to the associated product';
COMMENT ON COLUMN service_products.created_at IS 'Timestamp when the relationship was created';

-- Service Plans junction table description
COMMENT ON TABLE service_plans IS 'Junction table linking services with subscription plans, with configuration';
COMMENT ON COLUMN service_plans.id IS 'Unique identifier for the service-plan relationship';
COMMENT ON COLUMN service_plans.service_id IS 'Reference to the service';
COMMENT ON COLUMN service_plans.plan_id IS 'Reference to the subscription plan';
COMMENT ON COLUMN service_plans.duration IS 'Duration of service coverage under this plan (e.g., 30 days, 1 month)';
COMMENT ON COLUMN service_plans.requires_subscription IS 'Whether an active subscription is required to access this service';
COMMENT ON COLUMN service_plans.created_at IS 'Timestamp when the relationship was created';

-- Products table description (since it's referenced)
COMMENT ON TABLE products IS 'Healthcare products offered through the platform';
COMMENT ON COLUMN products.id IS 'Unique identifier for the product';
COMMENT ON COLUMN products.name IS 'Name of the product';
COMMENT ON COLUMN products.description IS 'Detailed description of the product';
COMMENT ON COLUMN products.price IS 'Price of the product in USD';
COMMENT ON COLUMN products.sku IS 'Stock keeping unit identifier';
COMMENT ON COLUMN products.category IS 'Product category (e.g., Devices, Supplies, Supplements)';
COMMENT ON COLUMN products.type IS 'Product type classification';
COMMENT ON COLUMN products.one_time_purchase_price IS 'One-time purchase price for the product';
COMMENT ON COLUMN products.fulfillment_source IS 'Source for product fulfillment';
COMMENT ON COLUMN products.requires_prescription IS 'Whether the product requires a prescription';
COMMENT ON COLUMN products.interaction_warnings IS 'Warnings about potential interactions';
COMMENT ON COLUMN products.stock_status IS 'Current stock status of the product';
COMMENT ON COLUMN products.image_url IS 'URL to the product image';
COMMENT ON COLUMN products.is_active IS 'Whether the product is currently active and available';
COMMENT ON COLUMN products.stripe_price_id IS 'Stripe price identifier';
COMMENT ON COLUMN products.stripe_one_time_price_id IS 'Stripe one-time price identifier';
COMMENT ON COLUMN products.created_at IS 'Timestamp when the product was created';
COMMENT ON COLUMN products.updated_at IS 'Timestamp when the product was last updated';

-- Subscription Plans table description (since it's referenced)
COMMENT ON TABLE subscription_plans IS 'Subscription plans offered to users';
COMMENT ON COLUMN subscription_plans.id IS 'Unique identifier for the subscription plan';
COMMENT ON COLUMN subscription_plans.name IS 'Name of the subscription plan';
COMMENT ON COLUMN subscription_plans.description IS 'Detailed description of the subscription plan';
COMMENT ON COLUMN subscription_plans.price IS 'Price of the subscription plan in USD';
COMMENT ON COLUMN subscription_plans.billing_frequency IS 'Billing frequency (e.g., monthly, quarterly, yearly)';
COMMENT ON COLUMN subscription_plans.delivery_frequency IS 'Frequency of delivery for subscription items';
COMMENT ON COLUMN subscription_plans.discount IS 'Discount applied to the subscription';
COMMENT ON COLUMN subscription_plans.category IS 'Category of the subscription plan';
COMMENT ON COLUMN subscription_plans.popularity IS 'Popularity ranking of the plan';
COMMENT ON COLUMN subscription_plans.requires_consultation IS 'Whether the plan requires an initial consultation';
COMMENT ON COLUMN subscription_plans.additional_benefits IS 'Additional benefits included in the plan';
COMMENT ON COLUMN subscription_plans.stripe_price_id IS 'Stripe price identifier';
COMMENT ON COLUMN subscription_plans.is_active IS 'Whether the subscription plan is currently active and available';
COMMENT ON COLUMN subscription_plans.created_at IS 'Timestamp when the subscription plan was created';
COMMENT ON COLUMN subscription_plans.updated_at IS 'Timestamp when the subscription plan was last updated';