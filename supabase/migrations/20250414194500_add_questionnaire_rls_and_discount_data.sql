-- Migration to add RLS for questionnaire and sample data for discounts

-- --- RLS for questionnaire ---
ALTER TABLE public.questionnaire ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin full access on questionnaire" ON public.questionnaire;
DROP POLICY IF EXISTS "Allow authenticated read access on questionnaire" ON public.questionnaire;
-- Admins can do anything
CREATE POLICY "Allow admin full access on questionnaire" ON public.questionnaire FOR ALL
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));
-- Allow any authenticated user to read questionnaires (adjust if needed)
CREATE POLICY "Allow authenticated read access on questionnaire" ON public.questionnaire FOR SELECT
  TO authenticated
  USING (true);

-- --- Sample Data for discounts ---
INSERT INTO public.discounts (name, code, description, status, percentage, start_date, end_date, usage_limit) VALUES
('New Patient Discount', 'NEWPATIENT10', '10% off first order for new patients.', true, 10, NOW(), NULL, 1),
('Summer Sale', 'SUMMER20', '20% off selected items for summer.', true, 20, '2025-06-01', '2025-08-31', NULL),
('Fixed Amount Off', 'SAVE25', '$25 off orders over $100.', true, NULL, NULL, NULL, 100) 
  ON CONFLICT (code) DO NOTHING; 
-- Manually set the 'amount' for the fixed discount after insert or handle in application logic
-- For simplicity in migration, we insert NULL for percentage here.
-- A separate UPDATE or application logic would set the 'amount' field based on type.
UPDATE public.discounts SET amount = 25.00 WHERE code = 'SAVE25';

INSERT INTO public.discounts (name, code, description, status, percentage, start_date, end_date) VALUES
('Expired Discount', 'EXPIRED5', '5% off, but expired.', false, 5, '2024-01-01', '2024-01-31')
  ON CONFLICT (code) DO NOTHING;
