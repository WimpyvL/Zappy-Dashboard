-- Ensure the updated_at trigger function exists
-- CREATE OR REPLACE FUNCTION trigger_set_timestamp()...

-- Create notes table
CREATE TABLE notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- Author of the note
  session_id uuid REFERENCES sessions(id) ON DELETE SET NULL, -- Optional link to a session
  note_type text DEFAULT 'general', -- e.g., 'general', 'follow_up', 'consultation', 'phone_call'
  content text NOT NULL,
  is_private boolean NOT NULL DEFAULT false -- Visibility control
);

-- Add indexes
CREATE INDEX idx_notes_patient_id ON notes(patient_id);
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_session_id ON notes(session_id);
CREATE INDEX idx_notes_note_type ON notes(note_type);

-- Trigger to automatically update updated_at timestamp
CREATE TRIGGER set_notes_timestamp
BEFORE UPDATE ON notes
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Enable Row Level Security (RLS)
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow users to manage their own notes
CREATE POLICY "Users can manage their own notes" ON notes
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Allow users to view non-private notes for patients they can access
-- Assumes users access patients via the 'user_id' link on the patients table.
CREATE POLICY "Users can view non-private notes for accessible patients" ON notes
  FOR SELECT USING (
    is_private = false AND
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = notes.patient_id AND p.user_id = auth.uid()
    )
  );

-- Optional: RLS Policy for admins/practitioners to view all relevant notes (including private ones)
-- CREATE POLICY "Allow practitioners/admins to view all patient notes" ON notes FOR SELECT USING (can_access_patient(notes.patient_id));

COMMENT ON TABLE notes IS 'Stores notes related to patients, potentially linked to sessions.';
COMMENT ON COLUMN notes.patient_id IS 'The patient the note is about.';
COMMENT ON COLUMN notes.user_id IS 'The user (practitioner/staff) who wrote the note.';
COMMENT ON COLUMN notes.session_id IS 'Optional link to the session during which the note was taken.';
COMMENT ON COLUMN notes.content IS 'The main content of the note.';
COMMENT ON COLUMN notes.is_private IS 'Indicates if the note should only be visible to the author/admins.';
