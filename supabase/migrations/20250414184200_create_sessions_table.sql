-- Migration to create the sessions table

-- Note: Assumes 'auth.users' table exists for provider_id and 'patients' for patient_id

CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL, -- Corrected reference
  provider_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Link to the provider/user conducting the session
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL, -- Optional link to the specific service provided
  consultation_id UUID REFERENCES public.consultations(id) ON DELETE SET NULL, -- Optional link to a related consultation
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER, -- Calculated or set duration
  status TEXT DEFAULT 'scheduled', -- e.g., scheduled, in-progress, completed, cancelled, no-show
  session_notes TEXT, -- Or link to the notes table
  meeting_link TEXT, -- Link for video call, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.sessions IS 'Stores information about scheduled or completed sessions between providers and patients.';
COMMENT ON COLUMN public.sessions.patient_id IS 'Links to the client record.';
COMMENT ON COLUMN public.sessions.provider_id IS 'Links to the user (provider) conducting the session.';

-- Enable RLS for sessions
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin full access on sessions" ON public.sessions;
DROP POLICY IF EXISTS "Allow related patient read access on sessions" ON public.sessions;
DROP POLICY IF EXISTS "Allow provider access on sessions" ON public.sessions;
-- Admins can do anything
CREATE POLICY "Allow admin full access on sessions" ON public.sessions FOR ALL
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));
-- Patients can read their own sessions
CREATE POLICY "Allow related patient read access on sessions" ON public.sessions FOR SELECT
  USING (EXISTS (SELECT 1 FROM patients WHERE patients.id = sessions.patient_id AND patients.id = auth.uid()));
-- Providers can manage sessions assigned to them
CREATE POLICY "Allow provider access on sessions" ON public.sessions FOR ALL
  USING (auth.uid() = provider_id)
  WITH CHECK (auth.uid() = provider_id);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_sessions_patient_id ON public.sessions (patient_id);
CREATE INDEX IF NOT EXISTS idx_sessions_provider_id ON public.sessions (provider_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.sessions (status);
CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON public.sessions (start_time);

-- Enable realtime (Optional)
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;
