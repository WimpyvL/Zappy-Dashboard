-- Migration to create the form_requests table

CREATE TYPE form_request_status AS ENUM ('pending', 'completed', 'expired', 'cancelled');

CREATE TABLE IF NOT EXISTS public.form_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  questionnaire_id UUID NOT NULL REFERENCES public.questionnaire(id) ON DELETE CASCADE,
  status form_request_status NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
  response_data JSONB, -- To store the submitted form answers
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- User who assigned the form
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.form_requests IS 'Tracks forms assigned to patients and their completion status/responses.';
COMMENT ON COLUMN public.form_requests.patient_id IS 'Links to the patient (patients).';
COMMENT ON COLUMN public.form_requests.questionnaire_id IS 'Links to the form template (questionnaire).';
COMMENT ON COLUMN public.form_requests.status IS 'Current status of the form request.';
COMMENT ON COLUMN public.form_requests.response_data IS 'Stores the patient submitted answers.';

-- Enable RLS
ALTER TABLE public.form_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Allow admin full access on form_requests" ON public.form_requests;
DROP POLICY IF EXISTS "Allow patient access to their own form_requests" ON public.form_requests;
DROP POLICY IF EXISTS "Allow assigned user read access on form_requests" ON public.form_requests; -- Optional

-- Admins can do anything
CREATE POLICY "Allow admin full access on form_requests" ON public.form_requests FOR ALL
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- Patients can read/update (submit) their own assigned forms
CREATE POLICY "Allow patient access to their own form_requests" ON public.form_requests FOR ALL
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

-- Optional: Allow the user who assigned the form to read it
-- CREATE POLICY "Allow assigned user read access on form_requests" ON public.form_requests FOR SELECT
--   USING (auth.uid() = assigned_by);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_form_requests_patient_id ON public.form_requests (patient_id);
CREATE INDEX IF NOT EXISTS idx_form_requests_questionnaire_id ON public.form_requests (questionnaire_id);
CREATE INDEX IF NOT EXISTS idx_form_requests_status ON public.form_requests (status);
