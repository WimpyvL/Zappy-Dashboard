-- Migration: Add AI Summaries Table
-- Description: Creates a table to store AI-generated summaries of intake forms for consultations

-- Create AI Summaries Table
CREATE TABLE IF NOT EXISTS ai_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  reasoning TEXT,
  category_id TEXT,
  prompt_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster lookups by consultation_id
CREATE INDEX IF NOT EXISTS idx_ai_summaries_consultation_id ON ai_summaries(consultation_id);

-- Add index for faster lookups by category_id
CREATE INDEX IF NOT EXISTS idx_ai_summaries_category_id ON ai_summaries(category_id);

-- Create AI Prompts Table if it doesn't exist
CREATE TABLE IF NOT EXISTS ai_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  prompt TEXT NOT NULL,
  category TEXT,
  prompt_type TEXT NOT NULL DEFAULT 'initial', -- Added prompt_type field: 'initial' or 'followup'
  section TEXT, -- Added section field: 'summary', 'assessment', 'plan', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster lookups by category
CREATE INDEX IF NOT EXISTS idx_ai_prompts_category ON ai_prompts(category);

-- Add index for faster lookups by prompt_type
CREATE INDEX IF NOT EXISTS idx_ai_prompts_type ON ai_prompts(prompt_type);

-- Add index for faster lookups by section
CREATE INDEX IF NOT EXISTS idx_ai_prompts_section ON ai_prompts(section);

-- Insert default prompts
INSERT INTO ai_prompts (name, prompt, category, prompt_type, section)
VALUES 
  -- Initial consultation prompts
  ('Weight Management Initial Summary', 'Analyze patient weight management data and provide treatment recommendations with reasoning.', 'weight_management', 'initial', 'summary'),
  ('ED Initial Treatment Recommendation', 'Analyze patient ED symptoms and provide treatment recommendations with reasoning.', 'ed', 'initial', 'summary'),
  ('Hair Loss Initial Treatment Recommendation', 'Analyze patient hair loss pattern and provide treatment recommendations with reasoning.', 'hair_loss', 'initial', 'summary'),
  ('General Health Initial Summary', 'Analyze patient health data and provide general treatment recommendations with reasoning.', 'general', 'initial', 'summary'),
  
  -- Follow-up consultation prompts
  ('Weight Management Follow-up Summary', 'Analyze patient progress with weight management treatment and provide updated recommendations.', 'weight_management', 'followup', 'summary'),
  ('ED Follow-up Treatment Recommendation', 'Analyze patient response to ED treatment and provide updated recommendations.', 'ed', 'followup', 'summary'),
  ('Hair Loss Follow-up Treatment Recommendation', 'Analyze patient response to hair loss treatment and provide updated recommendations.', 'hair_loss', 'followup', 'summary'),
  ('General Health Follow-up Summary', 'Analyze patient progress and provide updated general treatment recommendations.', 'general', 'followup', 'summary'),
  
  -- Assessment prompts
  ('Weight Management Assessment', 'Generate a comprehensive assessment of the patient''s weight management condition based on their data.', 'weight_management', 'initial', 'assessment'),
  ('ED Assessment', 'Generate a comprehensive assessment of the patient''s ED condition based on their data.', 'ed', 'initial', 'assessment'),
  ('Hair Loss Assessment', 'Generate a comprehensive assessment of the patient''s hair loss condition based on their data.', 'hair_loss', 'initial', 'assessment'),
  ('General Health Assessment', 'Generate a comprehensive assessment of the patient''s general health based on their data.', 'general', 'initial', 'assessment'),
  
  -- Plan prompts
  ('Weight Management Plan', 'Generate a treatment plan for the patient''s weight management condition.', 'weight_management', 'initial', 'plan'),
  ('ED Plan', 'Generate a treatment plan for the patient''s ED condition.', 'ed', 'initial', 'plan'),
  ('Hair Loss Plan', 'Generate a treatment plan for the patient''s hair loss condition.', 'hair_loss', 'initial', 'plan'),
  ('General Health Plan', 'Generate a general health treatment plan for the patient.', 'general', 'initial', 'plan');

-- Create AI Settings Table if it doesn't exist
CREATE TABLE IF NOT EXISTS ai_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_provider TEXT DEFAULT 'openai',
  api_key TEXT,
  model TEXT DEFAULT 'gpt-4',
  temperature FLOAT DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 1000,
  enable_consultation_summaries BOOLEAN DEFAULT TRUE,
  enable_product_recommendations BOOLEAN DEFAULT TRUE,
  enable_program_recommendations BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings if none exist
INSERT INTO ai_settings (api_provider, model, temperature, max_tokens)
SELECT 'openai', 'gpt-4', 0.7, 1000
WHERE NOT EXISTS (SELECT 1 FROM ai_settings);

-- Create AI Logs Table if it doesn't exist
CREATE TABLE IF NOT EXISTS ai_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt_id UUID REFERENCES ai_prompts(id) ON DELETE SET NULL,
  input TEXT,
  output TEXT,
  tokens_used INTEGER,
  duration_ms INTEGER,
  status TEXT,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster lookups by prompt_id
CREATE INDEX IF NOT EXISTS idx_ai_logs_prompt_id ON ai_logs(prompt_id);

-- Add index for faster lookups by created_at
CREATE INDEX IF NOT EXISTS idx_ai_logs_created_at ON ai_logs(created_at);

-- Add function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to update updated_at columns
CREATE TRIGGER update_ai_summaries_updated_at
BEFORE UPDATE ON ai_summaries
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_prompts_updated_at
BEFORE UPDATE ON ai_prompts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_settings_updated_at
BEFORE UPDATE ON ai_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();