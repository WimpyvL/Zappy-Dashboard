-- Migration to add support for multiple subscription plans per discount

-- Create a junction table for the many-to-many relationship
CREATE TABLE IF NOT EXISTS public.discount_subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    discount_id UUID NOT NULL REFERENCES public.discounts(id) ON DELETE CASCADE,
    subscription_plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(discount_id, subscription_plan_id)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_discount_subscription_plans_discount_id ON public.discount_subscription_plans (discount_id);
CREATE INDEX IF NOT EXISTS idx_discount_subscription_plans_subscription_plan_id ON public.discount_subscription_plans (subscription_plan_id);

-- Add comments for the table and columns
COMMENT ON TABLE public.discount_subscription_plans IS 'Junction table linking discounts to subscription plans';
COMMENT ON COLUMN public.discount_subscription_plans.discount_id IS 'Reference to the discount';
COMMENT ON COLUMN public.discount_subscription_plans.subscription_plan_id IS 'Reference to the subscription plan';
