-- Ensure the updated_at trigger function exists (created in patients migration)
-- CREATE OR REPLACE FUNCTION trigger_set_timestamp()... (if not already created)

-- Create orders table
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- User who placed/managed the order
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE, -- Patient associated with the order
  order_number text UNIQUE NOT NULL, -- Consider a sequence or generation function
  status text DEFAULT 'pending' NOT NULL, -- e.g., pending, processing, shipped, delivered, cancelled
  total_amount numeric(10, 2) NOT NULL DEFAULT 0.00,
  items jsonb, -- Array of order items: [{ "product_id": "uuid", "quantity": int, "price": numeric }]
  shipping_address jsonb,
  billing_address jsonb,
  notes text
);

-- Add indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_patient_id ON orders(patient_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_number ON orders(order_number);

-- Trigger to automatically update updated_at timestamp
CREATE TRIGGER set_orders_timestamp
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Enable Row Level Security (RLS)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow users to manage their own orders
CREATE POLICY "Users can manage their own orders" ON orders
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Allow users to view orders associated with patients they can access
-- This assumes users can access patients via the 'user_id' link on the patients table.
-- Adjust if access control is different (e.g., through an organization or shared access table).
CREATE POLICY "Users can view orders for accessible patients" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = orders.patient_id AND p.user_id = auth.uid()
    )
  );

-- Optional: RLS Policy for service_role or specific admin roles to bypass RLS
-- CREATE POLICY "Allow full access for admins" ON orders ...

COMMENT ON TABLE orders IS 'Stores customer order information.';
COMMENT ON COLUMN orders.user_id IS 'The user who placed or is managing the order.';
COMMENT ON COLUMN orders.patient_id IS 'The patient associated with this order.';
COMMENT ON COLUMN orders.items IS 'JSON array of items included in the order.';
COMMENT ON COLUMN orders.status IS 'Current status of the order processing/fulfillment.';
