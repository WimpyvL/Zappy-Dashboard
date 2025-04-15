-- Ensure the updated_at trigger function exists
-- CREATE OR REPLACE FUNCTION trigger_set_timestamp()...

-- Create forms table
CREATE TABLE forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- Creator/owner of the form
  title text NOT NULL,
  description text,
  fields jsonb NOT NULL, -- JSON definition of the form structure and fields
  is_active boolean NOT NULL DEFAULT true
);

-- Add indexes
CREATE INDEX idx_forms_user_id ON forms(user_id);
CREATE INDEX idx_forms_is_active ON forms(is_active);

-- Trigger to automatically update updated_at timestamp
CREATE TRIGGER set_forms_timestamp
BEFORE UPDATE ON forms
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Enable Row Level Security (RLS)
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow users to manage their own forms
CREATE POLICY "Users can manage their own forms" ON forms
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Allow authenticated users to view active forms (adjust if needed)
CREATE POLICY "Users can view active forms" ON forms
  FOR SELECT USING (is_active = true);

-- Optional: RLS Policy for service_role or specific admin roles to bypass RLS
-- CREATE POLICY "Allow full access for admins" ON forms ...

COMMENT ON TABLE forms IS 'Stores form definitions (structure and fields).';
COMMENT ON COLUMN forms.user_id IS 'The user who created or owns the form.';
COMMENT ON COLUMN forms.fields IS 'JSON definition of the form fields, types, validation, etc.';
COMMENT ON COLUMN forms.is_active IS 'Whether the form is currently available for submissions.';
