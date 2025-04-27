-- Migration: Create junction tables for service relationships
-- Description: Creates tables to link services with products and subscription plans

-- Create service_products junction table
CREATE TABLE IF NOT EXISTS service_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Unique constraint to prevent duplicate relationships
  UNIQUE(service_id, product_id)
);

-- Create service_plans junction table
CREATE TABLE IF NOT EXISTS service_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
  duration TEXT, -- e.g., "1 month", "90 days"
  requires_subscription BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Unique constraint to prevent duplicate relationships
  UNIQUE(service_id, plan_id)
);

-- Add requires_consultation column to services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS requires_consultation BOOLEAN DEFAULT TRUE;

-- Create Row Level Security Policies
-- Enable RLS on tables
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_plans ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can read services"
  ON services FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin users can insert/update/delete services"
  ON services FOR ALL
  USING (auth.role() = 'authenticated' AND (SELECT is_admin FROM auth.users WHERE id = auth.uid()));

-- Similar policies for junction tables
CREATE POLICY "Authenticated users can read service_products"
  ON service_products FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin users can insert/update/delete service_products"
  ON service_products FOR ALL
  USING (auth.role() = 'authenticated' AND (SELECT is_admin FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Authenticated users can read service_plans"
  ON service_plans FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin users can insert/update/delete service_plans"
  ON service_plans FOR ALL
  USING (auth.role() = 'authenticated' AND (SELECT is_admin FROM auth.users WHERE id = auth.uid()));

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_service_products_service_id ON service_products(service_id);
CREATE INDEX IF NOT EXISTS idx_service_products_product_id ON service_products(product_id);
CREATE INDEX IF NOT EXISTS idx_service_plans_service_id ON service_plans(service_id);
CREATE INDEX IF NOT EXISTS idx_service_plans_plan_id ON service_plans(plan_id);

-- Enable realtime for junction tables
ALTER PUBLICATION supabase_realtime ADD TABLE service_products;
ALTER PUBLICATION supabase_realtime ADD TABLE service_plans;