-- Enable the uuid-ossp extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create patients table
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    -- Add other relevant patient fields here (e.g., name, date_of_birth, contact_info)
    name VARCHAR(255),
    date_of_birth DATE,
    phone_number VARCHAR(20),
    email VARCHAR(255) UNIQUE
);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Create consultations table
CREATE TABLE consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    -- Add other relevant consultation fields here (e.g., date, type, notes)
    consultation_date TIMESTAMP WITH TIME ZONE,
    type VARCHAR(255),
    notes TEXT
);

ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

-- Create products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    -- Add other relevant product fields here (e.g., name, description, price)
    name VARCHAR(255),
    description TEXT,
    price DECIMAL(10, 2)
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create services table
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    -- Add other relevant service fields here (e.g., name, description, duration)
    name VARCHAR(255),
    description TEXT,
    duration_minutes INTEGER
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Create subscription_plans table
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    -- Add other relevant subscription plan fields here (e.g., name, price, features)
    name VARCHAR(255),
    price DECIMAL(10, 2),
    features TEXT
);

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Create pharmacies table
CREATE TABLE pharmacies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    -- Add other relevant pharmacy fields here (e.g., name, address, contact_info)
    name VARCHAR(255),
    address TEXT,
    phone_number VARCHAR(20),
    email VARCHAR(255)
);

ALTER TABLE pharmacies ENABLE ROW LEVEL SECURITY;

-- Create audit_logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    user_id UUID, -- Assuming a user is associated with the log
    action VARCHAR(255),
    details JSONB
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    -- Add other relevant order fields here (e.g., order_date, total_amount, status)
    order_date TIMESTAMP WITH TIME ZONE,
    total_amount DECIMAL(10, 2),
    status VARCHAR(255)
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create discounts table
CREATE TABLE discounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    -- Add other relevant discount fields here (e.g., code, percentage, valid_until)
    code VARCHAR(255) UNIQUE,
    percentage DECIMAL(5, 2),
    valid_until DATE
);

ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;

-- Create forms table
CREATE TABLE forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    -- Add other relevant form fields here (e.g., name, description, definition)
    name VARCHAR(255),
    description TEXT,
    definition JSONB
);

ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

-- Create form_submissions table
CREATE TABLE form_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    -- Add other relevant form submission fields here (e.g., submission_date, data)
    submission_date TIMESTAMP WITH TIME ZONE,
    data JSONB
);

ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- Create insurances table
CREATE TABLE insurances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    -- Add other relevant insurance fields here (e.g., name, policy_number)
    name VARCHAR(255),
    policy_number VARCHAR(255)
);

ALTER TABLE insurances ENABLE ROW LEVEL SECURITY;

-- Create insurance_records table
CREATE TABLE insurance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    insurance_id UUID REFERENCES insurances(id) ON DELETE CASCADE,
    -- Add other relevant insurance record fields here (e.g., coverage_details)
    coverage_details TEXT
);

ALTER TABLE insurance_records ENABLE ROW LEVEL SECURITY;

-- Create insurance_documents table
CREATE TABLE insurance_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    insurance_record_id UUID REFERENCES insurance_records(id) ON DELETE CASCADE,
    -- Add other relevant insurance document fields here (e.g., file_path, file_name)
    file_path VARCHAR(255),
    file_name VARCHAR(255)
);

ALTER TABLE insurance_documents ENABLE ROW LEVEL SECURITY;

-- Create patient_insurances join table
CREATE TABLE patient_insurances (
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    insurance_id UUID REFERENCES insurances(id) ON DELETE CASCADE,
    PRIMARY KEY (patient_id, insurance_id)
);

ALTER TABLE patient_insurances ENABLE ROW LEVEL SECURITY;

-- Create invoices table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    -- Add other relevant invoice fields here (e.g., invoice_date, total_amount, status)
    invoice_date TIMESTAMP WITH TIME ZONE,
    total_amount DECIMAL(10, 2),
    status VARCHAR(255)
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Create tags table
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    -- Add other relevant tag fields here (e.g., name)
    name VARCHAR(255) UNIQUE
);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- Create tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    -- Add other relevant task fields here (e.g., description, due_date, status)
    description TEXT,
    due_date DATE,
    status VARCHAR(255)
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create sessions table
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    -- Add other relevant session fields here (e.g., session_date, type, notes)
    session_date TIMESTAMP WITH TIME ZONE,
    type VARCHAR(255),
    notes TEXT
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Create notes table
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    -- Add other relevant note fields here (e.g., note_date, content)
    note_date TIMESTAMP WITH TIME ZONE,
    content TEXT
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    user_id UUID, -- Assuming notifications are for users
    -- Add other relevant notification fields here (e.g., type, message, read_status)
    type VARCHAR(255),
    message TEXT,
    read_status BOOLEAN DEFAULT FALSE
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE, -- Assuming profiles are linked to auth.users
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    -- Add other relevant profile fields here (e.g., username, avatar_url)
    username VARCHAR(255) UNIQUE,
    avatar_url VARCHAR(255)
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create referral_settings table
CREATE TABLE referral_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    -- Add other relevant referral settings fields here (e.g., enabled, reward_amount)
    enabled BOOLEAN DEFAULT TRUE,
    reward_amount DECIMAL(10, 2)
);

ALTER TABLE referral_settings ENABLE ROW LEVEL SECURITY;

-- Create referrals table
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    referrer_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- Assuming referrer is a user profile
    referred_patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    -- Add other relevant referral fields here (e.g., referral_date, status)
    referral_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(255)
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Create api_logs table
CREATE TABLE api_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    request_method VARCHAR(10),
    request_path VARCHAR(255),
    status_code INTEGER,
    response_time_ms INTEGER
);

ALTER TABLE api_logs ENABLE ROW LEVEL SECURITY;

-- Create form_requests table
CREATE TABLE form_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
    -- Add other relevant form request fields here (e.g., request_date, status)
    request_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(255)
);

ALTER TABLE form_requests ENABLE ROW LEVEL SECURITY;

-- Create questionnaire table (assuming this is the same as forms based on context)
-- CREATE TABLE questionnaire (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
--     updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
--     name VARCHAR(255),
--     description TEXT,
--     definition JSONB
-- );

-- Create questionnaire_question table (if implemented)
CREATE TABLE questionnaire_question (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    questionnaire_id UUID REFERENCES forms(id) ON DELETE CASCADE, -- Assuming link to forms/questionnaire
    -- Add other relevant questionnaire question fields here (e.g., question_text, type, options)
    question_text TEXT,
    type VARCHAR(255),
    options JSONB
);

ALTER TABLE questionnaire_question ENABLE ROW LEVEL SECURITY;

-- Create ai_prompts table
CREATE TABLE ai_prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    -- Add other relevant AI prompt fields here (e.g., name, prompt_text, usage_count)
    name VARCHAR(255) UNIQUE,
    prompt_text TEXT,
    usage_count INTEGER DEFAULT 0
);

ALTER TABLE ai_prompts ENABLE ROW LEVEL SECURITY;

-- Create patient_tags join table
CREATE TABLE patient_tags (
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (patient_id, tag_id)
);

ALTER TABLE patient_tags ENABLE ROW LEVEL SECURITY;

-- Create product_tags join table
CREATE TABLE product_tags (
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, tag_id)
);

ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;

-- Create service_tags join table
CREATE TABLE service_tags (
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (service_id, tag_id)
);

ALTER TABLE service_tags ENABLE ROW LEVEL SECURITY;

-- Create patient_products join table
CREATE TABLE patient_products (
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    PRIMARY KEY (patient_id, product_id)
);

ALTER TABLE patient_products ENABLE ROW LEVEL SECURITY;

-- Create patient_services join table
CREATE TABLE patient_services (
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    PRIMARY KEY (patient_id, service_id)
);

ALTER TABLE patient_services ENABLE ROW LEVEL SECURITY;

-- Create questionnaire_responses table (if implemented)
CREATE TABLE questionnaire_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    submission_id UUID REFERENCES form_submissions(id) ON DELETE CASCADE, -- Assuming link to form_submissions
    question_id UUID REFERENCES questionnaire_question(id) ON DELETE CASCADE,
    -- Add other relevant questionnaire response fields here (e.g., response_text, response_value)
    response_text TEXT,
    response_value JSONB
);

ALTER TABLE questionnaire_responses ENABLE ROW LEVEL SECURITY;

-- Create frontend_errors table
CREATE TABLE frontend_errors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    user_id UUID, -- Assuming a user is associated with the error
    error_message TEXT,
    error_details JSONB
);

ALTER TABLE frontend_errors ENABLE ROW LEVEL SECURITY;

-- Create storage bucket for insurance documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('insurance-documents', 'insurance-documents', false);
