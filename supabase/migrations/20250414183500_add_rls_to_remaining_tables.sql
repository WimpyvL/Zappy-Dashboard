-- Migration to add RLS policies to tables created after 20240322000003

-- Ensure profiles table exists for role checks
-- CREATE TABLE IF NOT EXISTS public.profiles (...); -- Assumed created in 20250414172300

-- --- RLS for pb_tasks ---
ALTER TABLE public.pb_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin full access on pb_tasks" ON public.pb_tasks;
DROP POLICY IF EXISTS "Allow assigned user access on pb_tasks" ON public.pb_tasks;
DROP POLICY IF EXISTS "Allow related patient read access on pb_tasks" ON public.pb_tasks;
-- Admins can do anything
CREATE POLICY "Allow admin full access on pb_tasks" ON public.pb_tasks FOR ALL
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));
-- Users can CRUD tasks assigned to them
CREATE POLICY "Allow assigned user access on pb_tasks" ON public.pb_tasks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
-- Patients can read tasks linked to them (using client_record_id FK)
CREATE POLICY "Allow related patient read access on pb_tasks" ON public.pb_tasks FOR SELECT
  USING (EXISTS (SELECT 1 FROM client_record WHERE client_record.id = pb_tasks.client_record_id AND client_record.id = auth.uid()));

-- --- RLS for insurance_records ---
ALTER TABLE public.insurance_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin full access on insurance_records" ON public.insurance_records;
DROP POLICY IF EXISTS "Allow related patient access on insurance_records" ON public.insurance_records;
-- Admins can do anything
CREATE POLICY "Allow admin full access on insurance_records" ON public.insurance_records FOR ALL
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));
-- Patients can CRUD their own insurance records (using client_record_id FK)
CREATE POLICY "Allow related patient access on insurance_records" ON public.insurance_records FOR ALL
  USING (EXISTS (SELECT 1 FROM client_record WHERE client_record.id = insurance_records.client_record_id AND client_record.id = auth.uid())) 
  WITH CHECK (EXISTS (SELECT 1 FROM client_record WHERE client_record.id = insurance_records.client_record_id AND client_record.id = auth.uid())); 

-- --- RLS for insurance_documents ---
ALTER TABLE public.insurance_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin full access on insurance_documents" ON public.insurance_documents;
DROP POLICY IF EXISTS "Allow related patient access via record on insurance_documents" ON public.insurance_documents;
DROP POLICY IF EXISTS "Allow uploader access on insurance_documents" ON public.insurance_documents;
-- Admins can do anything
CREATE POLICY "Allow admin full access on insurance_documents" ON public.insurance_documents FOR ALL
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));
-- Patients can access documents linked to their insurance records
CREATE POLICY "Allow related patient access via record on insurance_documents" ON public.insurance_documents FOR ALL
  USING (EXISTS (
    SELECT 1 FROM insurance_records ir
    JOIN client_record cr ON ir.client_record_id = cr.id -- Corrected FK join condition
    WHERE ir.id = insurance_documents.insurance_record_id AND cr.id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM insurance_records ir
    JOIN client_record cr ON ir.client_record_id = cr.id -- Corrected FK join condition
    WHERE ir.id = insurance_documents.insurance_record_id AND cr.id = auth.uid()
  ));
-- Allow the user who uploaded the document to manage it (optional)
CREATE POLICY "Allow uploader access on insurance_documents" ON public.insurance_documents FOR ALL
  USING (auth.uid() = uploaded_by)
  WITH CHECK (auth.uid() = uploaded_by);


-- --- RLS for pb_invoices ---
ALTER TABLE public.pb_invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin full access on pb_invoices" ON public.pb_invoices;
DROP POLICY IF EXISTS "Allow related patient read access on pb_invoices" ON public.pb_invoices;
-- Admins can do anything
CREATE POLICY "Allow admin full access on pb_invoices" ON public.pb_invoices FOR ALL
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));
-- Patients can read their own invoices (using client_record_id FK)
CREATE POLICY "Allow related patient read access on pb_invoices" ON public.pb_invoices FOR SELECT
  USING (EXISTS (SELECT 1 FROM client_record WHERE client_record.id = pb_invoices.client_record_id AND client_record.id = auth.uid())); 

-- --- RLS for notes ---
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin full access on notes" ON public.notes;
DROP POLICY IF EXISTS "Allow author access on notes" ON public.notes;
DROP POLICY IF EXISTS "Allow related patient read access on notes" ON public.notes;
-- Admins can do anything
CREATE POLICY "Allow admin full access on notes" ON public.notes FOR ALL
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));
-- Authors can manage their own notes
CREATE POLICY "Allow author access on notes" ON public.notes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
-- Patients can read notes linked to them (using client_record_id FK)
CREATE POLICY "Allow related patient read access on notes" ON public.notes FOR SELECT
  USING (EXISTS (SELECT 1 FROM client_record WHERE client_record.id = notes.client_record_id AND client_record.id = auth.uid())); 

-- --- RLS for notifications ---
-- Policies already created in migration 20240322000017, just ensure RLS is enabled
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- --- RLS for orders --- (Moved to 20250414184000_create_orders_tables.sql)

-- --- RLS for order_items --- (Moved to 20250414184000_create_orders_tables.sql)

-- --- RLS for sessions --- (Moved to 20250414184200_create_sessions_table.sql)
