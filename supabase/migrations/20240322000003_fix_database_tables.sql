-- Add RLS policies to tables potentially created in earlier migrations

-- Ensure the uuid-ossp extension is enabled (required by multiple tables)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Note: Table creation logic removed as tables should already exist.
-- We are only adding RLS and policies here. Assuming 'profiles' table exists for role checks.

-- Enable RLS and add policies for client_record
ALTER TABLE public.client_record ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin full access on client_record" ON public.client_record;
DROP POLICY IF EXISTS "Allow authenticated read access on client_record" ON public.client_record;
CREATE POLICY "Allow admin full access on client_record" ON public.client_record FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')) WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));
CREATE POLICY "Allow authenticated read access on client_record" ON public.client_record FOR SELECT TO authenticated USING (true);
-- TODO: Add policy for users to access their own record if client_record.id matches auth.uid() or via a link table.

-- Enable RLS and add policies for consultations
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin full access on consultations" ON public.consultations;
DROP POLICY IF EXISTS "Allow users to read/update their own consultations" ON public.consultations;
CREATE POLICY "Allow admin full access on consultations" ON public.consultations FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')) WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));
-- Assuming client_id in consultations links to client_record.id, and client_record.id matches auth.uid() for the patient
CREATE POLICY "Allow users to read/update their own consultations" ON public.consultations FOR ALL USING (EXISTS (SELECT 1 FROM client_record WHERE client_record.id = consultations.client_id AND client_record.id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM client_record WHERE client_record.id = consultations.client_id AND client_record.id = auth.uid()));

-- Enable RLS and add policies for products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin full access on products" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated read access on products" ON public.products;
CREATE POLICY "Allow admin full access on products" ON public.products FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')) WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));
CREATE POLICY "Allow authenticated read access on products" ON public.products FOR SELECT TO authenticated USING (true);

-- Enable RLS and add policies for services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin full access on services" ON public.services;
DROP POLICY IF EXISTS "Allow authenticated read access on services" ON public.services;
CREATE POLICY "Allow admin full access on services" ON public.services FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')) WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));
CREATE POLICY "Allow authenticated read access on services" ON public.services FOR SELECT TO authenticated USING (true);

-- Enable RLS and add policies for subscription_plans
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin full access on subscription_plans" ON public.subscription_plans;
DROP POLICY IF EXISTS "Allow authenticated read access on subscription_plans" ON public.subscription_plans;
CREATE POLICY "Allow admin full access on subscription_plans" ON public.subscription_plans FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')) WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));
CREATE POLICY "Allow authenticated read access on subscription_plans" ON public.subscription_plans FOR SELECT TO authenticated USING (true);

-- Enable RLS and add policies for pharmacies
ALTER TABLE public.pharmacies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin full access on pharmacies" ON public.pharmacies;
DROP POLICY IF EXISTS "Allow authenticated read access on pharmacies" ON public.pharmacies;
CREATE POLICY "Allow admin full access on pharmacies" ON public.pharmacies FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')) WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));
CREATE POLICY "Allow authenticated read access on pharmacies" ON public.pharmacies FOR SELECT TO authenticated USING (true);

-- Enable RLS and add policies for tags
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin full access on tags" ON public.tags;
DROP POLICY IF EXISTS "Allow authenticated read access on tags" ON public.tags;
CREATE POLICY "Allow admin full access on tags" ON public.tags FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')) WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));
CREATE POLICY "Allow authenticated read access on tags" ON public.tags FOR SELECT TO authenticated USING (true);

-- Note: Realtime enabling statements removed as they are likely redundant/cause errors if run again.
