-- Create bundles table
CREATE TABLE IF NOT EXISTS public.bundles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    bundle_id TEXT UNIQUE NOT NULL,
    category TEXT,
    price DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) DEFAULT 0,
    status TEXT DEFAULT 'active',
    description TEXT,
    features JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create bundle_products junction table
CREATE TABLE IF NOT EXISTS public.bundle_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bundle_id UUID NOT NULL REFERENCES public.bundles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(bundle_id, product_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_bundles_category ON public.bundles (category);
CREATE INDEX IF NOT EXISTS idx_bundles_status ON public.bundles (status);
CREATE INDEX IF NOT EXISTS idx_bundle_products_bundle_id ON public.bundle_products (bundle_id);
CREATE INDEX IF NOT EXISTS idx_bundle_products_product_id ON public.bundle_products (product_id);

-- Create trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bundles_updated_at
BEFORE UPDATE ON public.bundles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
