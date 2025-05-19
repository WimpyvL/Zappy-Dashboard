-- Migration: Add Note Templates System
-- Description: This migration adds tables and functions for managing patient note templates

-- Create note_templates table
CREATE TABLE IF NOT EXISTS note_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    encounter_type TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Add comment to the table
COMMENT ON TABLE note_templates IS 'Templates for patient notes used in different types of encounters';

-- Add comments to columns
COMMENT ON COLUMN note_templates.id IS 'Unique identifier for the template';
COMMENT ON COLUMN note_templates.name IS 'Name of the template';
COMMENT ON COLUMN note_templates.content IS 'Content of the template with placeholders';
COMMENT ON COLUMN note_templates.category IS 'Service category the template belongs to (e.g., weight_management, ed)';
COMMENT ON COLUMN note_templates.encounter_type IS 'Type of encounter the template is for (e.g., initial_consultation, follow_up)';
COMMENT ON COLUMN note_templates.is_active IS 'Whether the template is active and available for use';
COMMENT ON COLUMN note_templates.created_at IS 'When the template was created';
COMMENT ON COLUMN note_templates.updated_at IS 'When the template was last updated';
COMMENT ON COLUMN note_templates.created_by IS 'User who created the template';
COMMENT ON COLUMN note_templates.updated_by IS 'User who last updated the template';

-- Create template_placeholders table to track available placeholders
CREATE TABLE IF NOT EXISTS template_placeholders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    example TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add comment to the table
COMMENT ON TABLE template_placeholders IS 'Available placeholders for use in note templates';

-- Add comments to columns
COMMENT ON COLUMN template_placeholders.id IS 'Unique identifier for the placeholder';
COMMENT ON COLUMN template_placeholders.name IS 'Name of the placeholder (e.g., [MEDICATIONS_LIST])';
COMMENT ON COLUMN template_placeholders.description IS 'Description of what the placeholder represents';
COMMENT ON COLUMN template_placeholders.example IS 'Example of how the placeholder might be replaced';
COMMENT ON COLUMN template_placeholders.is_active IS 'Whether the placeholder is active and available for use';
COMMENT ON COLUMN template_placeholders.created_at IS 'When the placeholder was created';
COMMENT ON COLUMN template_placeholders.updated_at IS 'When the placeholder was last updated';

-- Create consultation_notes table to store the actual notes sent to patients
CREATE TABLE IF NOT EXISTS consultation_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultation_id UUID NOT NULL REFERENCES consultations(id),
    template_id UUID REFERENCES note_templates(id),
    content TEXT NOT NULL,
    is_sent BOOLEAN NOT NULL DEFAULT false,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Add comment to the table
COMMENT ON TABLE consultation_notes IS 'Notes sent to patients after consultations';

-- Add comments to columns
COMMENT ON COLUMN consultation_notes.id IS 'Unique identifier for the note';
COMMENT ON COLUMN consultation_notes.consultation_id IS 'ID of the consultation this note is for';
COMMENT ON COLUMN consultation_notes.template_id IS 'ID of the template used to create this note (if any)';
COMMENT ON COLUMN consultation_notes.content IS 'Content of the note with placeholders replaced';
COMMENT ON COLUMN consultation_notes.is_sent IS 'Whether the note has been sent to the patient';
COMMENT ON COLUMN consultation_notes.sent_at IS 'When the note was sent to the patient';
COMMENT ON COLUMN consultation_notes.created_at IS 'When the note was created';
COMMENT ON COLUMN consultation_notes.updated_at IS 'When the note was last updated';
COMMENT ON COLUMN consultation_notes.created_by IS 'User who created the note';
COMMENT ON COLUMN consultation_notes.updated_by IS 'User who last updated the note';

-- Insert default placeholders
INSERT INTO template_placeholders (name, description, example)
VALUES
    ('[PATIENT_NAME]', 'Patient''s full name', 'John Smith'),
    ('[PROVIDER_NAME]', 'Provider''s full name', 'Dr. Jane Doe'),
    ('[MEDICATIONS_LIST]', 'List of prescribed medications with dosages', '- Semaglutide 0.25mg weekly\n- Metformin 500mg daily'),
    ('[FOLLOW_UP_PERIOD]', 'When the patient should follow up', '2 weeks'),
    ('[CONSULTATION_DATE]', 'Date of the consultation', 'May 19, 2025'),
    ('[PATIENT_FIRST_NAME]', 'Patient''s first name', 'John'),
    ('[PATIENT_LAST_NAME]', 'Patient''s last name', 'Smith'),
    ('[PROVIDER_FIRST_NAME]', 'Provider''s first name', 'Jane'),
    ('[PROVIDER_LAST_NAME]', 'Provider''s last name', 'Doe'),
    ('[PROVIDER_CREDENTIALS]', 'Provider''s credentials', 'MD, PhD'),
    ('[CLINIC_NAME]', 'Name of the clinic', 'Zappy Health Clinic'),
    ('[CLINIC_PHONE]', 'Phone number of the clinic', '(555) 123-4567'),
    ('[CLINIC_EMAIL]', 'Email address of the clinic', 'contact@zappyhealth.com'),
    ('[CLINIC_ADDRESS]', 'Address of the clinic', '123 Main St, San Francisco, CA 94105'),
    ('[PATIENT_PORTAL_URL]', 'URL to the patient portal', 'https://patient.zappyhealth.com');

-- Insert default templates
INSERT INTO note_templates (name, content, category, encounter_type)
VALUES
    ('Weight Management Initial Consultation', 'Dear [PATIENT_NAME],

Thank you for your initial consultation with our weight management program. Based on our discussion, I''ve prescribed the following treatment plan:

[MEDICATIONS_LIST]

Please take these medications as directed. It''s important to:
- Follow the dosage instructions carefully
- Report any side effects immediately
- Continue your healthy eating and exercise plan
- Track your weight weekly

We''ll follow up in [FOLLOW_UP_PERIOD] to assess your progress and make any necessary adjustments to your treatment plan.

If you have any questions or concerns before then, please don''t hesitate to reach out through the patient portal.

Best regards,
[PROVIDER_NAME]', 'weight_management', 'initial_consultation'),

    ('ED Initial Consultation', 'Dear [PATIENT_NAME],

Thank you for your initial consultation. I''ve prescribed the following medication for your erectile dysfunction:

[MEDICATIONS_LIST]

Important instructions:
- Take this medication as needed, approximately 30-60 minutes before sexual activity
- Do not take more than one dose in 24 hours
- Avoid high-fat meals before taking, as they may delay effectiveness
- Do not use with nitrates or alpha-blockers

We''ll follow up in [FOLLOW_UP_PERIOD] to assess how the medication is working for you and address any concerns.

Please contact us immediately if you experience any concerning side effects.

Best regards,
[PROVIDER_NAME]', 'ed', 'initial_consultation'),

    ('Weight Management Follow-up', 'Dear [PATIENT_NAME],

Thank you for your follow-up appointment for our weight management program. Based on our discussion today, we''ll continue with the following treatment plan:

[MEDICATIONS_LIST]

Your progress has been noted, and I''m pleased with how you''re responding to the treatment. Please continue to:
- Take your medications as prescribed
- Maintain your dietary and exercise regimen
- Monitor and record any side effects
- Track your weight and measurements weekly

Our next follow-up is scheduled for [FOLLOW_UP_PERIOD] from now. If you have any questions or concerns in the meantime, please reach out through the patient portal.

Best regards,
[PROVIDER_NAME]', 'weight_management', 'follow_up'),

    ('ED Follow-up', 'Dear [PATIENT_NAME],

Thank you for your follow-up appointment. Based on our discussion about your experience with the medication, we''ll continue with:

[MEDICATIONS_LIST]

Remember these important points:
- Continue taking the medication as needed before sexual activity
- Do not exceed the recommended dosage
- Stay hydrated and avoid excessive alcohol consumption
- Report any new or worsening side effects immediately

Our next follow-up is scheduled for [FOLLOW_UP_PERIOD] from now. If you have any questions or concerns in the meantime, please don''t hesitate to contact us.

Best regards,
[PROVIDER_NAME]', 'ed', 'follow_up');

-- Create function to process template with placeholders
CREATE OR REPLACE FUNCTION process_note_template(
    template_id UUID,
    consultation_id UUID,
    custom_placeholders JSONB DEFAULT '{}'::JSONB
) RETURNS TEXT AS $$
DECLARE
    template_content TEXT;
    processed_content TEXT;
    consultation_record RECORD;
    patient_record RECORD;
    provider_record RECORD;
    medications_list TEXT := '';
    follow_up_period TEXT := '';
BEGIN
    -- Get template content
    SELECT content INTO template_content
    FROM note_templates
    WHERE id = template_id;
    
    IF template_content IS NULL THEN
        RAISE EXCEPTION 'Template with ID % not found', template_id;
    END IF;
    
    -- Get consultation data
    SELECT c.*, 
           p.id as patient_id, 
           p.first_name as patient_first_name, 
           p.last_name as patient_last_name,
           pr.id as provider_id,
           pr.first_name as provider_first_name,
           pr.last_name as provider_last_name,
           pr.credentials as provider_credentials
    INTO consultation_record
    FROM consultations c
    JOIN patients p ON c.patient_id = p.id
    JOIN providers pr ON c.provider_id = pr.id
    WHERE c.id = consultation_id;
    
    IF consultation_record IS NULL THEN
        RAISE EXCEPTION 'Consultation with ID % not found', consultation_id;
    END IF;
    
    -- Start with the template content
    processed_content := template_content;
    
    -- Replace standard placeholders
    processed_content := REPLACE(processed_content, '[PATIENT_NAME]', 
                                consultation_record.patient_first_name || ' ' || consultation_record.patient_last_name);
    processed_content := REPLACE(processed_content, '[PATIENT_FIRST_NAME]', consultation_record.patient_first_name);
    processed_content := REPLACE(processed_content, '[PATIENT_LAST_NAME]', consultation_record.patient_last_name);
    
    processed_content := REPLACE(processed_content, '[PROVIDER_NAME]', 
                                consultation_record.provider_first_name || ' ' || consultation_record.provider_last_name || 
                                CASE WHEN consultation_record.provider_credentials IS NOT NULL 
                                     THEN ', ' || consultation_record.provider_credentials
                                     ELSE '' END);
    processed_content := REPLACE(processed_content, '[PROVIDER_FIRST_NAME]', consultation_record.provider_first_name);
    processed_content := REPLACE(processed_content, '[PROVIDER_LAST_NAME]', consultation_record.provider_last_name);
    processed_content := REPLACE(processed_content, '[PROVIDER_CREDENTIALS]', COALESCE(consultation_record.provider_credentials, ''));
    
    processed_content := REPLACE(processed_content, '[CONSULTATION_DATE]', 
                                TO_CHAR(consultation_record.created_at, 'Month DD, YYYY'));
    
    -- Get medications list from consultation
    SELECT STRING_AGG('- ' || m.name || ' ' || m.dosage || ' ' || m.frequency, E'\n')
    INTO medications_list
    FROM consultation_medications m
    WHERE m.consultation_id = consultation_id;
    
    processed_content := REPLACE(processed_content, '[MEDICATIONS_LIST]', COALESCE(medications_list, 'No medications prescribed'));
    
    -- Get follow-up period
    SELECT period_display
    INTO follow_up_period
    FROM follow_ups
    WHERE consultation_id = consultation_id
    ORDER BY created_at DESC
    LIMIT 1;
    
    processed_content := REPLACE(processed_content, '[FOLLOW_UP_PERIOD]', COALESCE(follow_up_period, '4 weeks'));
    
    -- Replace clinic information
    processed_content := REPLACE(processed_content, '[CLINIC_NAME]', 'Zappy Health Clinic');
    processed_content := REPLACE(processed_content, '[CLINIC_PHONE]', '(555) 123-4567');
    processed_content := REPLACE(processed_content, '[CLINIC_EMAIL]', 'contact@zappyhealth.com');
    processed_content := REPLACE(processed_content, '[CLINIC_ADDRESS]', '123 Main St, San Francisco, CA 94105');
    processed_content := REPLACE(processed_content, '[PATIENT_PORTAL_URL]', 'https://patient.zappyhealth.com');
    
    -- Replace custom placeholders
    IF custom_placeholders IS NOT NULL AND jsonb_typeof(custom_placeholders) = 'object' THEN
        FOR key, value IN SELECT * FROM jsonb_each_text(custom_placeholders) LOOP
            processed_content := REPLACE(processed_content, '[' || key || ']', value);
        END LOOP;
    END IF;
    
    RETURN processed_content;
END;
$$ LANGUAGE plpgsql;

-- Create function to create a note from a template
CREATE OR REPLACE FUNCTION create_note_from_template(
    p_consultation_id UUID,
    p_template_id UUID,
    p_custom_placeholders JSONB DEFAULT '{}'::JSONB,
    p_created_by UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    processed_content TEXT;
    note_id UUID;
BEGIN
    -- Process the template
    processed_content := process_note_template(p_template_id, p_consultation_id, p_custom_placeholders);
    
    -- Create the note
    INSERT INTO consultation_notes (
        consultation_id,
        template_id,
        content,
        created_by
    ) VALUES (
        p_consultation_id,
        p_template_id,
        processed_content,
        p_created_by
    )
    RETURNING id INTO note_id;
    
    RETURN note_id;
END;
$$ LANGUAGE plpgsql;

-- Add RLS policies
ALTER TABLE note_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_placeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_notes ENABLE ROW LEVEL SECURITY;

-- Policies for note_templates
CREATE POLICY "Providers can view all templates" 
    ON note_templates FOR SELECT 
    USING (
        auth.role() = 'authenticated' AND 
        EXISTS (SELECT 1 FROM providers WHERE user_id = auth.uid())
    );

CREATE POLICY "Providers can create templates" 
    ON note_templates FOR INSERT 
    WITH CHECK (
        auth.role() = 'authenticated' AND 
        EXISTS (SELECT 1 FROM providers WHERE user_id = auth.uid())
    );

CREATE POLICY "Providers can update templates" 
    ON note_templates FOR UPDATE 
    USING (
        auth.role() = 'authenticated' AND 
        EXISTS (SELECT 1 FROM providers WHERE user_id = auth.uid())
    );

CREATE POLICY "Providers can delete templates" 
    ON note_templates FOR DELETE 
    USING (
        auth.role() = 'authenticated' AND 
        EXISTS (SELECT 1 FROM providers WHERE user_id = auth.uid())
    );

-- Policies for template_placeholders
CREATE POLICY "Anyone can view placeholders" 
    ON template_placeholders FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can modify placeholders" 
    ON template_placeholders FOR ALL 
    USING (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM providers 
            WHERE user_id = auth.uid() AND is_admin = true
        )
    );

-- Policies for consultation_notes
CREATE POLICY "Providers can view all notes" 
    ON consultation_notes FOR SELECT 
    USING (
        auth.role() = 'authenticated' AND 
        EXISTS (SELECT 1 FROM providers WHERE user_id = auth.uid())
    );

CREATE POLICY "Patients can view their own notes" 
    ON consultation_notes FOR SELECT 
    USING (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM consultations c
            JOIN patients p ON c.patient_id = p.id
            WHERE c.id = consultation_id AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "Providers can create notes" 
    ON consultation_notes FOR INSERT 
    WITH CHECK (
        auth.role() = 'authenticated' AND 
        EXISTS (SELECT 1 FROM providers WHERE user_id = auth.uid())
    );

CREATE POLICY "Providers can update notes" 
    ON consultation_notes FOR UPDATE 
    USING (
        auth.role() = 'authenticated' AND 
        EXISTS (SELECT 1 FROM providers WHERE user_id = auth.uid())
    );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_note_templates_timestamp
BEFORE UPDATE ON note_templates
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_template_placeholders_timestamp
BEFORE UPDATE ON template_placeholders
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_consultation_notes_timestamp
BEFORE UPDATE ON consultation_notes
FOR EACH ROW EXECUTE FUNCTION update_timestamp();
