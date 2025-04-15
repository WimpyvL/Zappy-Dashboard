-- Ensure the updated_at trigger function exists
-- CREATE OR REPLACE FUNCTION trigger_set_timestamp()...

-- Create sessions table
CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- Practitioner/doctor conducting the session
  session_type text, -- e.g., 'initial_consultation', 'follow_up', 'virtual_checkin'
  session_date timestamptz NOT NULL,
  duration_minutes integer CHECK (duration_minutes IS NULL OR duration_minutes > 0),
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  notes text, -- Brief summary notes, longer notes might be in a separate table
  meeting_url text -- URL for virtual sessions
);

-- Add indexes
CREATE INDEX idx_sessions_patient_id ON sessions(patient_id);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_session_date ON sessions(session_date);
CREATE INDEX idx_sessions_status ON sessions(status);

-- Trigger to automatically update updated_at timestamp
CREATE TRIGGER set_sessions_timestamp
BEFORE UPDATE ON sessions
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Enable Row Level Security (RLS)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow users (patients) to view their own sessions
CREATE POLICY "Patients can view their own sessions" ON sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = sessions.patient_id AND p.user_id = auth.uid()
    )
  );

-- RLS Policy: Allow assigned practitioners to manage sessions they are assigned to
CREATE POLICY "Practitioners can manage their assigned sessions" ON sessions
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Optional: RLS Policy for admins/schedulers to manage all sessions
-- CREATE POLICY "Allow schedulers/admins full access" ON sessions FOR ALL USING (is_scheduler_or_admin(auth.uid()));

COMMENT ON TABLE sessions IS 'Stores information about patient consultation sessions.';
COMMENT ON COLUMN sessions.patient_id IS 'The patient participating in the session.';
COMMENT ON COLUMN sessions.user_id IS 'The practitioner (user) conducting the session.';
COMMENT ON COLUMN sessions.session_date IS 'The scheduled date and time of the session.';
COMMENT ON COLUMN sessions.status IS 'The current status of the session.';
