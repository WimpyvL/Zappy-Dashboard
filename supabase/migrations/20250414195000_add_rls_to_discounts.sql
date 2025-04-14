-- Migration to add RLS policies for the discounts table

-- Enable RLS for discounts
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist from any previous attempts
DROP POLICY IF EXISTS "Allow admin full access on discounts" ON public.discounts;
DROP POLICY IF EXISTS "Allow authenticated read access on discounts" ON public.discounts;

-- Admins can do anything
CREATE POLICY "Allow admin full access on discounts" ON public.discounts FOR ALL
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- Allow any authenticated user to read discounts (adjust if needed)
CREATE POLICY "Allow authenticated read access on discounts" ON public.discounts FOR SELECT
  TO authenticated
  USING (true);
