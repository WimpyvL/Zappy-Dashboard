-- Create questionnaire table
CREATE TABLE IF NOT EXISTS questionnaire (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL, -- Corresponds to 'title' in hooks
  description TEXT,
  structure JSONB, -- Assumed to hold form definition (pages, fields, etc.)
  status BOOLEAN DEFAULT true, -- Assumed based on hook logic
  form_type TEXT, -- Assumed based on hook logic
  slug TEXT UNIQUE, -- Added UNIQUE constraint, common for slugs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime for this table, only if it isn't already added
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'questionnaire') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.questionnaire;
  END IF;
END $$;

-- Add indexes for commonly queried columns
CREATE INDEX IF NOT EXISTS idx_questionnaire_status ON questionnaire (status);
CREATE INDEX IF NOT EXISTS idx_questionnaire_slug ON questionnaire (slug);
CREATE INDEX IF NOT EXISTS idx_questionnaire_form_type ON questionnaire (form_type);

-- Optional: Add table for individual questions if structure is relational
-- CREATE TABLE IF NOT EXISTS questionnaire_question (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   questionnaire_id UUID REFERENCES questionnaire(id) ON DELETE CASCADE,
--   question_text TEXT NOT NULL,
--   question_type TEXT NOT NULL, -- e.g., 'text', 'select', 'checkbox'
--   options JSONB, -- For select, radio, checkbox types
--   is_required BOOLEAN DEFAULT false,
--   order_index INTEGER DEFAULT 0,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );
-- ALTER PUBLICATION supabase_realtime ADD TABLE questionnaire_question;
-- CREATE INDEX IF NOT EXISTS idx_questionnaire_question_questionnaire_id ON questionnaire_question (questionnaire_id);
