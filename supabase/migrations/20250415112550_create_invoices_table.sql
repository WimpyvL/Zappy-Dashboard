-- Ensure the updated_at trigger function exists
-- CREATE OR REPLACE FUNCTION trigger_set_timestamp()...

-- Create invoices table
CREATE TABLE invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  invoice_number text UNIQUE NOT NULL, -- Consider sequence or generation function
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL, -- Optional link to an order
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'partial', 'overdue', 'void')),
  total_amount numeric(10, 2) NOT NULL CHECK (total_amount >= 0),
  amount_paid numeric(10, 2) DEFAULT 0.00 CHECK (amount_paid >= 0),
  line_items jsonb, -- Array: [{ description, quantity, unit_price, total }]
  notes text,

  CONSTRAINT amount_paid_check CHECK (amount_paid <= total_amount) -- Ensure paid amount doesn't exceed total
);

-- Add indexes
CREATE INDEX idx_invoices_patient_id ON invoices(patient_id);
CREATE INDEX idx_invoices_order_id ON invoices(order_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

-- Trigger to automatically update updated_at timestamp
CREATE TRIGGER set_invoices_timestamp
BEFORE UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Enable Row Level Security (RLS)
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow users to manage invoices for patients they can access
-- Assumes users access patients via the 'user_id' link on the patients table.
CREATE POLICY "Users can manage invoices for accessible patients" ON invoices
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = invoices.patient_id AND p.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = invoices.patient_id AND p.user_id = auth.uid()
    )
  );

-- Optional: RLS Policy for service_role or specific admin roles to bypass RLS
-- CREATE POLICY "Allow full access for admins" ON invoices ...

COMMENT ON TABLE invoices IS 'Stores billing invoice information.';
COMMENT ON COLUMN invoices.patient_id IS 'The patient associated with this invoice.';
COMMENT ON COLUMN invoices.order_id IS 'Optional link to the order that generated this invoice.';
COMMENT ON COLUMN invoices.status IS 'Current status of the invoice (draft, sent, paid, etc.).';
COMMENT ON COLUMN invoices.line_items IS 'JSON array detailing the items or services being invoiced.';
