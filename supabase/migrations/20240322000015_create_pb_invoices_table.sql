-- Create pb_invoices table
CREATE TABLE IF NOT EXISTS pb_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_record_id UUID REFERENCES client_record(id) ON DELETE SET NULL, -- Link to patient
  status TEXT DEFAULT 'pending', -- e.g., pending, paid, failed, refunded
  pb_invoice_id TEXT, -- Optional: External invoice ID (e.g., from Stripe)
  pb_invoice_metadata JSONB, -- Store items, total, tax, discounts, etc.
  notes TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  paid_date TIMESTAMP WITH TIME ZONE,
  refunded BOOLEAN DEFAULT false,
  refunded_amount DECIMAL(10, 2) DEFAULT 0,
  date_created TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- Consider renaming or removing if using created_at
  date_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- Consider renaming or removing if using updated_at
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE pb_invoices;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_pb_invoices_client_record_id ON pb_invoices (client_record_id);
CREATE INDEX IF NOT EXISTS idx_pb_invoices_status ON pb_invoices (status);
CREATE INDEX IF NOT EXISTS idx_pb_invoices_pb_invoice_id ON pb_invoices (pb_invoice_id);
