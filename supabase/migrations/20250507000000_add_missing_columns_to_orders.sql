-- Migration to add missing columns to orders table

-- Add pharmacy_id column with foreign key reference to pharmacies table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS pharmacy_id UUID REFERENCES public.pharmacies(id) ON DELETE SET NULL;

-- Add linked_session_id column with foreign key reference to sessions table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS linked_session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL;

-- Add hold_reason column for pending orders
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS hold_reason TEXT;

-- Add tracking_number column for shipped orders
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS tracking_number TEXT;

-- Add estimated_delivery column for shipped orders
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS estimated_delivery TIMESTAMP WITH TIME ZONE;

-- Add indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_orders_pharmacy_id ON public.orders (pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_orders_linked_session_id ON public.orders (linked_session_id);

-- Add comment for the new columns
COMMENT ON COLUMN public.orders.pharmacy_id IS 'Links to the pharmacy record.';
COMMENT ON COLUMN public.orders.linked_session_id IS 'Links to the related session record.';
COMMENT ON COLUMN public.orders.hold_reason IS 'Reason for holding a pending order.';
COMMENT ON COLUMN public.orders.tracking_number IS 'Tracking number for shipped orders.';
COMMENT ON COLUMN public.orders.estimated_delivery IS 'Estimated delivery date for shipped orders.';
