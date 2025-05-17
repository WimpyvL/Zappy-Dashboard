-- Create forms tables for the form management system

-- Create questionnaire table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.questionnaire (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    structure JSONB NOT NULL DEFAULT '{"pages": [], "conditionals": []}',
    is_active BOOLEAN DEFAULT TRUE,
    form_type VARCHAR(50) DEFAULT 'general',
    slug VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL
);

-- Add comment to questionnaire table
COMMENT ON TABLE public.questionnaire IS 'Stores form templates that can be sent to patients';

-- Create form_requests table to track forms sent to patients
CREATE TABLE IF NOT EXISTS public.form_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    questionnaire_id UUID NOT NULL REFERENCES public.questionnaire(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    sent_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deadline_date TIMESTAMP WITH TIME ZONE,
    completed_date TIMESTAMP WITH TIME ZONE,
    response_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Add comment to form_requests table
COMMENT ON TABLE public.form_requests IS 'Tracks forms sent to patients and their completion status';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_questionnaire_name ON public.questionnaire(name);
CREATE INDEX IF NOT EXISTS idx_questionnaire_form_type ON public.questionnaire(form_type);
CREATE INDEX IF NOT EXISTS idx_questionnaire_is_active ON public.questionnaire(is_active);

CREATE INDEX IF NOT EXISTS idx_form_requests_patient_id ON public.form_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_form_requests_questionnaire_id ON public.form_requests(questionnaire_id);
CREATE INDEX IF NOT EXISTS idx_form_requests_status ON public.form_requests(status);

-- Add Row Level Security (RLS) policies
ALTER TABLE public.questionnaire ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for questionnaire table
CREATE POLICY "Questionnaire accessible by authenticated users" 
    ON public.questionnaire FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Questionnaire editable by authenticated users" 
    ON public.questionnaire FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Questionnaire updatable by authenticated users" 
    ON public.questionnaire FOR UPDATE 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Questionnaire deletable by authenticated users" 
    ON public.questionnaire FOR DELETE 
    USING (auth.role() = 'authenticated');

-- Create policies for form_requests table
CREATE POLICY "Form requests accessible by authenticated users" 
    ON public.form_requests FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Form requests insertable by authenticated users" 
    ON public.form_requests FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Form requests updatable by authenticated users" 
    ON public.form_requests FOR UPDATE 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Form requests deletable by authenticated users" 
    ON public.form_requests FOR DELETE 
    USING (auth.role() = 'authenticated');
