-- Create form_submissions table
CREATE TABLE form_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  form_id uuid NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- User who submitted the form (if logged in)
  patient_id uuid REFERENCES patients(id) ON DELETE SET NULL, -- Patient associated with the submission (if applicable)
  submission_data jsonb NOT NULL -- The actual submitted form data/answers
);

-- Add indexes
CREATE INDEX idx_form_submissions_form_id ON form_submissions(form_id);
CREATE INDEX idx_form_submissions_user_id ON form_submissions(user_id);
CREATE INDEX idx_form_submissions_patient_id ON form_submissions(patient_id);

-- Enable Row Level Security (RLS)
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow users to view their own submissions
CREATE POLICY "Users can view their own submissions" ON form_submissions
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policy: Allow users who own the form to view all its submissions
CREATE POLICY "Form owners can view submissions" ON form_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM forms f
      WHERE f.id = form_submissions.form_id AND f.user_id = auth.uid()
    )
  );

-- RLS Policy: Allow users to insert submissions (assuming they can view the form)
-- This might need adjustment based on whether anonymous submissions are allowed
-- or if submission requires specific permissions.
CREATE POLICY "Users can insert submissions for viewable forms" ON form_submissions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM forms f
      WHERE f.id = form_submissions.form_id
      -- Add check here if only logged-in users can submit: AND auth.role() = 'authenticated'
    )
  );

-- Optional: RLS Policy for service_role or specific admin roles to bypass RLS
-- CREATE POLICY "Allow full access for admins" ON form_submissions ...

COMMENT ON TABLE form_submissions IS 'Stores submitted data for forms.';
COMMENT ON COLUMN form_submissions.form_id IS 'The form definition this submission belongs to.';
COMMENT ON COLUMN form_submissions.user_id IS 'The user who submitted the form, if authenticated.';
COMMENT ON COLUMN form_submissions.patient_id IS 'The patient associated with this submission, if applicable.';
COMMENT ON COLUMN form_submissions.submission_data IS 'JSON object containing the submitted form answers.';
