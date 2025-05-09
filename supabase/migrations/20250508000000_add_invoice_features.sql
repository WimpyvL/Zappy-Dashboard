-- Add new columns to invoices table for enhanced features
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS billing_type VARCHAR(20) DEFAULT 'one-time',
ADD COLUMN IF NOT EXISTS recurring_frequency VARCHAR(20) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS recurring_duration INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS subscription_plan_id UUID DEFAULT NULL,
ADD COLUMN IF NOT EXISTS discount_id UUID DEFAULT NULL,
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10, 2) DEFAULT 0;

-- Add foreign key constraints
ALTER TABLE invoices
ADD CONSTRAINT fk_invoice_subscription_plan
FOREIGN KEY (subscription_plan_id)
REFERENCES subscription_plans(id)
ON DELETE SET NULL;

ALTER TABLE invoices
ADD CONSTRAINT fk_invoice_discount
FOREIGN KEY (discount_id)
REFERENCES discounts(id)
ON DELETE SET NULL;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_invoices_subscription_plan_id ON invoices(subscription_plan_id);
CREATE INDEX IF NOT EXISTS idx_invoices_discount_id ON invoices(discount_id);

-- Add comment to explain the purpose of these columns
COMMENT ON COLUMN invoices.billing_type IS 'Type of billing: one-time or recurring';
COMMENT ON COLUMN invoices.recurring_frequency IS 'Frequency for recurring invoices: weekly, monthly, quarterly, annually';
COMMENT ON COLUMN invoices.recurring_duration IS 'Number of billing cycles for recurring invoices, 0 for indefinite';
COMMENT ON COLUMN invoices.subscription_plan_id IS 'Reference to subscription plan if invoice is for a subscription';
COMMENT ON COLUMN invoices.discount_id IS 'Reference to discount applied to this invoice';
COMMENT ON COLUMN invoices.discount_amount IS 'Amount of discount applied to this invoice';
COMMENT ON COLUMN invoices.tax_rate IS 'Tax rate percentage applied to this invoice';
COMMENT ON COLUMN invoices.tax_amount IS 'Amount of tax applied to this invoice';
