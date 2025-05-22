-- Migration: Add Invoice Tables
-- Description: Creates tables for invoice generation after consultation approval

-- Add invoice_id column to consultations table if it doesn't exist
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS invoice_id UUID REFERENCES pb_invoices(id) ON DELETE SET NULL;
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS approval_notes JSONB DEFAULT '{}'::jsonb;

-- Create product_subscription_plans table if it doesn't exist
CREATE TABLE IF NOT EXISTS product_subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL,
  subscription_plan_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, subscription_plan_id)
);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_product_subscription_plans_product_id ON product_subscription_plans(product_id);
CREATE INDEX IF NOT EXISTS idx_product_subscription_plans_subscription_plan_id ON product_subscription_plans(subscription_plan_id);

-- Add function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to update updated_at column for product_subscription_plans
CREATE TRIGGER update_product_subscription_plans_updated_at
BEFORE UPDATE ON product_subscription_plans
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add subscription_id column to orders table if it doesn't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES patient_subscriptions(id) ON DELETE SET NULL;

-- Add invoice_id column to orders table if it doesn't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_id UUID REFERENCES pb_invoices(id) ON DELETE SET NULL;

-- Add status column to orders table if it doesn't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Add payment_status column to orders table if it doesn't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';

-- Add subscription_id column to pb_invoices table if it doesn't exist
ALTER TABLE pb_invoices ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES patient_subscriptions(id) ON DELETE SET NULL;

-- Add consultation_id column to pb_invoices table if it doesn't exist
ALTER TABLE pb_invoices ADD COLUMN IF NOT EXISTS consultation_id UUID REFERENCES consultations(id) ON DELETE SET NULL;

-- Add order_id column to pb_invoices table if it doesn't exist
ALTER TABLE pb_invoices ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id) ON DELETE SET NULL;

-- Add paid_at column to pb_invoices table if it doesn't exist
ALTER TABLE pb_invoices ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE;

-- Add payment_method column to pb_invoices table if it doesn't exist
ALTER TABLE pb_invoices ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Add payment_id column to pb_invoices table if it doesn't exist
ALTER TABLE pb_invoices ADD COLUMN IF NOT EXISTS payment_id TEXT;

-- Add tax_amount column to pb_invoices table if it doesn't exist
ALTER TABLE pb_invoices ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10, 2) DEFAULT 0;

-- Create function to update order status when invoice is paid
CREATE OR REPLACE FUNCTION update_order_status_on_invoice_paid()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
    -- Update order status
    UPDATE orders
    SET status = 'processing', payment_status = 'paid', updated_at = NOW()
    WHERE id = NEW.order_id;
    
    -- Update consultation status if not already approved
    UPDATE consultations
    SET status = 'approved', updated_at = NOW()
    WHERE id = NEW.consultation_id AND status = 'pending_review';
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update order status when invoice is paid
DROP TRIGGER IF EXISTS update_order_status_on_invoice_paid_trigger ON pb_invoices;
CREATE TRIGGER update_order_status_on_invoice_paid_trigger
AFTER UPDATE ON pb_invoices
FOR EACH ROW
WHEN (NEW.status = 'paid' AND OLD.status != 'paid')
EXECUTE FUNCTION update_order_status_on_invoice_paid();

-- Create function to update subscription status when invoice is paid
CREATE OR REPLACE FUNCTION update_subscription_status_on_invoice_paid()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'paid' AND OLD.status != 'paid' AND NEW.subscription_id IS NOT NULL THEN
    -- Update subscription status
    UPDATE patient_subscriptions
    SET status = 'active', updated_at = NOW()
    WHERE id = NEW.subscription_id;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update subscription status when invoice is paid
DROP TRIGGER IF EXISTS update_subscription_status_on_invoice_paid_trigger ON pb_invoices;
CREATE TRIGGER update_subscription_status_on_invoice_paid_trigger
AFTER UPDATE ON pb_invoices
FOR EACH ROW
WHEN (NEW.status = 'paid' AND OLD.status != 'paid' AND NEW.subscription_id IS NOT NULL)
EXECUTE FUNCTION update_subscription_status_on_invoice_paid();