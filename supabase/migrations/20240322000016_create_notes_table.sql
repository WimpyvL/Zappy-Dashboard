-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patients_id UUID REFERENCES patients(id) ON DELETE CASCADE, -- Link to patient (CASCADE delete?)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Link to author (SET NULL on delete?)
  note_type TEXT, -- e.g., 'Clinical', 'Follow-up', 'Administrative'
  title TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE notes;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_notes_patients_id ON notes (patients_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes (user_id);
CREATE INDEX IF NOT EXISTS idx_notes_note_type ON notes (note_type);
