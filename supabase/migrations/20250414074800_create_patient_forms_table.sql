-- Migration to create the patient_forms table

CREATE TABLE IF NOT EXISTS patient_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES client_record(id) ON DELETE CASCADE, -- Link to the patient
  questionnaire_id UUID NOT NULL REFERENCES questionnaire(id) ON DELETE RESTRICT, -- Link to the form template
  status TEXT NOT NULL DEFAULT 'pending', -- e.g., 'pending', 'submitted', 'reviewed'
  answers JSONB, -- Store submitted answers
  submitted_at TIMESTAMP WITH TIME ZONE, -- When the form was submitted
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_patient_forms_patient_id ON patient_forms(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_forms_questionnaire_id ON patient_forms(questionnaire_id);
CREATE INDEX IF NOT EXISTS idx_patient_forms_status ON patient_forms(status);

-- Add comments for clarity
COMMENT ON TABLE patient_forms IS 'Stores assigned or submitted forms for each patient.';
COMMENT ON COLUMN patient_forms.patient_id IS 'Foreign key referencing the patient (client_record).';
COMMENT ON COLUMN patient_forms.questionnaire_id IS 'Foreign key referencing the form template (questionnaire).';
COMMENT ON COLUMN patient_forms.status IS 'The current status of the patient''s form (e.g., pending, submitted, reviewed).';
COMMENT ON COLUMN patient_forms.answers IS 'JSONB data containing the patient''s submitted answers.';
COMMENT ON COLUMN patient_forms.submitted_at IS 'Timestamp when the patient submitted the form.';

-- Enable realtime for the new table, only if it isn't already added
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'patient_forms') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.patient_forms;
  END IF;
END $$;
