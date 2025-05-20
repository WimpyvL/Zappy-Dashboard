-- Migration: Add Follow-up System Tables
-- Description: Creates tables for patient follow-ups, follow-up templates, and scheduled notifications

-- Create follow_up_templates table
CREATE TABLE IF NOT EXISTS follow_up_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  period TEXT NOT NULL,
  description TEXT,
  intake_form_schema JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create patient_follow_ups table
CREATE TABLE IF NOT EXISTS patient_follow_ups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  template_id UUID REFERENCES follow_up_templates(id),
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'completed', 'cancelled', 'missed')),
  intake_form_submission_id UUID REFERENCES form_submissions(id),
  provider_notes TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  invoice_id UUID REFERENCES invoices(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scheduled_notifications table
CREATE TABLE IF NOT EXISTS scheduled_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  reference_id UUID NOT NULL,
  reference_type TEXT NOT NULL,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'sent', 'failed', 'cancelled')),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_patient_follow_ups_patient_id ON patient_follow_ups(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_follow_ups_consultation_id ON patient_follow_ups(consultation_id);
CREATE INDEX IF NOT EXISTS idx_patient_follow_ups_scheduled_date ON patient_follow_ups(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_patient_follow_ups_status ON patient_follow_ups(status);
CREATE INDEX IF NOT EXISTS idx_patient_follow_ups_payment_status ON patient_follow_ups(payment_status);

CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_patient_id ON scheduled_notifications(patient_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_reference_id ON scheduled_notifications(reference_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_scheduled_date ON scheduled_notifications(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_status ON scheduled_notifications(status);

-- Add RLS policies
ALTER TABLE follow_up_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_notifications ENABLE ROW LEVEL SECURITY;

-- Policies for follow_up_templates
CREATE POLICY "Providers can view all follow-up templates"
  ON follow_up_templates FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage follow-up templates"
  ON follow_up_templates FOR ALL
  USING (auth.role() = 'authenticated' AND is_admin());

-- Policies for patient_follow_ups
CREATE POLICY "Providers can view all patient follow-ups"
  ON patient_follow_ups FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Providers can manage patient follow-ups"
  ON patient_follow_ups FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Patients can view their own follow-ups"
  ON patient_follow_ups FOR SELECT
  USING (auth.role() = 'authenticated' AND patient_id = auth.uid());

-- Policies for scheduled_notifications
CREATE POLICY "Providers can view all scheduled notifications"
  ON scheduled_notifications FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Providers can manage scheduled notifications"
  ON scheduled_notifications FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Patients can view their own scheduled notifications"
  ON scheduled_notifications FOR SELECT
  USING (auth.role() = 'authenticated' AND patient_id = auth.uid());

-- Insert default follow-up templates
INSERT INTO follow_up_templates (name, category, period, description, intake_form_schema)
VALUES
  (
    'Weight Management 2-Week Follow-up',
    'weight_management',
    '2w',
    'Standard 2-week follow-up for weight management patients',
    '{
      "sections": [
        {
          "title": "Progress Update",
          "questions": [
            {
              "id": "current_weight",
              "type": "number",
              "label": "Current Weight",
              "required": true,
              "unit": "lbs"
            },
            {
              "id": "side_effects",
              "type": "checkbox",
              "label": "Have you experienced any side effects?",
              "options": ["Nausea", "Fatigue", "Headache", "Dizziness", "None"]
            }
          ]
        },
        {
          "title": "Medication Adherence",
          "questions": [
            {
              "id": "missed_doses",
              "type": "radio",
              "label": "Have you missed any doses?",
              "options": ["No", "Yes, 1-2 doses", "Yes, 3+ doses"]
            }
          ]
        }
      ]
    }'
  ),
  (
    'Weight Management 4-Week Follow-up',
    'weight_management',
    '4w',
    'Standard 4-week follow-up for weight management patients',
    '{
      "sections": [
        {
          "title": "Progress Update",
          "questions": [
            {
              "id": "current_weight",
              "type": "number",
              "label": "Current Weight",
              "required": true,
              "unit": "lbs"
            },
            {
              "id": "weight_change",
              "type": "text",
              "label": "How do you feel about your weight change?",
              "required": true
            },
            {
              "id": "side_effects",
              "type": "checkbox",
              "label": "Have you experienced any side effects?",
              "options": ["Nausea", "Fatigue", "Headache", "Dizziness", "None"]
            }
          ]
        },
        {
          "title": "Medication Adherence",
          "questions": [
            {
              "id": "missed_doses",
              "type": "radio",
              "label": "Have you missed any doses?",
              "options": ["No", "Yes, 1-2 doses", "Yes, 3+ doses"]
            },
            {
              "id": "lifestyle_changes",
              "type": "checkbox",
              "label": "What lifestyle changes have you implemented?",
              "options": ["Diet changes", "Increased exercise", "Better sleep", "Stress reduction", "None"]
            }
          ]
        }
      ]
    }'
  ),
  (
    'ED 4-Week Follow-up',
    'ed',
    '4w',
    'Standard 4-week follow-up for ED patients',
    '{
      "sections": [
        {
          "title": "Treatment Effectiveness",
          "questions": [
            {
              "id": "effectiveness",
              "type": "radio",
              "label": "How effective has your treatment been?",
              "required": true,
              "options": ["Very effective", "Somewhat effective", "Not effective"]
            },
            {
              "id": "side_effects",
              "type": "checkbox",
              "label": "Have you experienced any side effects?",
              "options": ["Headache", "Flushing", "Upset stomach", "Vision changes", "None"]
            }
          ]
        },
        {
          "title": "Medication Usage",
          "questions": [
            {
              "id": "frequency_of_use",
              "type": "radio",
              "label": "How often have you used the medication?",
              "options": ["Not at all", "1-2 times", "3-5 times", "More than 5 times"]
            }
          ]
        }
      ]
    }'
  );
