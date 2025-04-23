-- Migration to create orders and order_items tables

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL, -- Corrected reference
  order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'pending', -- e.g., pending, processing, shipped, completed, cancelled
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  shipping_address JSONB, -- Could store address details or reference patients
  billing_address JSONB,
  invoice_id UUID REFERENCES public.pb_invoices(id) ON DELETE SET NULL, -- Optional link to invoice
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT false, -- Added for soft delete consistency
  deleted_at TIMESTAMP WITH TIME ZONE -- Added for soft delete consistency
);

COMMENT ON TABLE public.orders IS 'Stores customer order information.';
COMMENT ON COLUMN public.orders.patient_id IS 'Links to the client record.';

-- Create order_items table (Junction Table)
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price_at_order DECIMAL(10, 2) NOT NULL, -- Price when the order was placed
  CONSTRAINT check_item_type CHECK (product_id IS NOT NULL OR service_id IS NOT NULL) -- Ensure at least one item type is linked
);

COMMENT ON TABLE public.order_items IS 'Stores individual items associated with an order.';

-- Enable RLS for orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin full access on orders" ON public.orders;
DROP POLICY IF EXISTS "Allow related patient read access on orders" ON public.orders;
-- Admins can do anything
CREATE POLICY "Allow admin full access on orders" ON public.orders FOR ALL
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));
-- Patients can read their own orders
CREATE POLICY "Allow related patient read access on orders" ON public.orders FOR SELECT
  USING (EXISTS (SELECT 1 FROM patients WHERE patients.id = orders.patient_id AND patients.id = auth.uid()));

-- Enable RLS for order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin full access on order_items" ON public.order_items;
DROP POLICY IF EXISTS "Allow related patient read access via order on order_items" ON public.order_items;
-- Admins can do anything
CREATE POLICY "Allow admin full access on order_items" ON public.order_items FOR ALL
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));
-- Patients can read items belonging to their orders
CREATE POLICY "Allow related patient read access via order on order_items" ON public.order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM orders o
    JOIN patients cr ON o.patient_id = cr.id
    WHERE o.id = order_items.order_id AND cr.id = auth.uid()
  ));

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_orders_patient_id ON public.orders (patient_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items (product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_service_id ON public.order_items (service_id);

-- Enable realtime (Optional)
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;
