-- Optimized Schema File
-- WARNING: Running this script will DROP existing tables and DELETE all data.

-- Drop existing tables in reverse order of dependency, or use CASCADE
DROP TABLE IF EXISTS patient_tags CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS pb_invoices CASCADE;
DROP TABLE IF EXISTS insurance_document CASCADE;
DROP TABLE IF EXISTS insurance_policy CASCADE;
DROP TABLE IF EXISTS pb_tasks CASCADE;
DROP TABLE IF EXISTS consultations CASCADE;
DROP TABLE IF EXISTS api_logs CASCADE;
DROP TABLE IF EXISTS frontend_errors CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS discounts CASCADE;
DROP TABLE IF EXISTS pharmacies CASCADE;
DROP TABLE IF EXISTS questionnaire CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS tag CASCADE;
DROP TABLE IF EXISTS patients CASCADE; -- Formerly client_record
DROP TABLE IF EXISTS client_record CASCADE; -- Drop old name just in case
DROP TABLE IF EXISTS test CASCADE; -- Drop test table if it exists

-- Ensure the uuid-ossp extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Optimized Tables --

-- Renamed from client_record
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  date_of_birth DATE,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
-- Add indexes
CREATE INDEX idx_patients_email ON patients(email);
CREATE INDEX idx_patients_name ON patients(last_name, first_name);

-- Renamed from insurance_records
CREATE TABLE insurance_policy (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE, -- Changed from SET NULL to CASCADE
  provider_name TEXT NOT NULL,
  policy_number TEXT,
  group_number TEXT,
  subscriber_name TEXT,
  subscriber_dob DATE,
  status TEXT DEFAULT 'Pending', -- Consider an ENUM type if status values are fixed
  verification_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
-- Add indexes
CREATE INDEX idx_insurance_policy_patient_id ON insurance_policy(patient_id);
CREATE INDEX idx_insurance_policy_status ON insurance_policy(status);

-- Renamed from insurance_documents
CREATE TABLE insurance_document (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  insurance_policy_id UUID NOT NULL REFERENCES insurance_policy(id) ON DELETE CASCADE, -- Changed from SET NULL to CASCADE
  file_name TEXT NOT NULL,
  storage_path TEXT UNIQUE NOT NULL,
  url TEXT,
  document_type TEXT, -- e.g., 'front_card', 'back_card', 'verification_letter'
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
-- Add indexes
CREATE INDEX idx_insurance_document_policy_id ON insurance_document(insurance_policy_id);

CREATE TABLE consultations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE, -- Changed from SET NULL to CASCADE
  consultation_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- Consider ENUM
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- Renamed
  scheduled_at TIMESTAMP WITH TIME ZONE, -- Renamed
  completed_at TIMESTAMP WITH TIME ZONE, -- Renamed
  provider_notes TEXT,
  client_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
-- Add indexes
CREATE INDEX idx_consultations_patient_id ON consultations(patient_id);
CREATE INDEX idx_consultations_status ON consultations(status);
CREATE INDEX idx_consultations_scheduled_at ON consultations(scheduled_at);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT UNIQUE, -- Added UNIQUE constraint
  category TEXT,
  type TEXT NOT NULL DEFAULT 'medication', -- Added type (medication, supplement, service)
  price DECIMAL(10, 2) DEFAULT 0.00, -- Price for non-medication one-time purchase
  one_time_purchase_price DECIMAL(10, 2) DEFAULT 0.00, -- Price for medication one-time purchase
  allow_one_time_purchase BOOLEAN DEFAULT FALSE, -- Flag for non-medication one-time
  fulfillment_source TEXT, -- e.g., compounding_pharmacy, retail_pharmacy, internal_supplement, internal_service
  requires_prescription BOOLEAN DEFAULT TRUE,
  interaction_warnings TEXT[], -- Array of warnings
  doses JSONB, -- Array of {value, description, allowOneTimePurchase, stripePriceId} for medications
  stock_status TEXT DEFAULT 'in-stock', -- e.g., in-stock, limited, out-of-stock, backorder
  image_url TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  stripe_price_id TEXT, -- Stripe Price ID for non-medication one-time purchase
  stripe_one_time_price_id TEXT, -- Stripe Price ID for medication one-time purchase
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
-- Add indexes
CREATE INDEX idx_products_type ON products(type);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_active ON products(is_active);

-- Kept name plural as it represents distinct services offered
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE, -- Made name unique
  description TEXT,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  duration_minutes INTEGER,
  category TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
-- Add indexes
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_is_active ON services(is_active);

-- Kept name plural as it represents distinct plans
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE, -- Made name unique
  description TEXT,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  billing_frequency TEXT NOT NULL, -- e.g., monthly, quarterly, annually
  delivery_frequency TEXT, -- e.g., monthly, bimonthly
  discount INTEGER DEFAULT 0, -- Percentage discount
  allowed_product_doses JSONB, -- Array of {productId, doseId}
  category TEXT,
  popularity TEXT DEFAULT 'medium', -- e.g., low, medium, high
  requires_consultation BOOLEAN DEFAULT TRUE,
  additional_benefits TEXT[], -- Array of benefit strings
  features JSONB, -- Kept original features column if still used
  stripe_price_id TEXT, -- Stripe Price ID for the subscription plan itself
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
-- Add indexes
CREATE INDEX idx_subscription_plans_category ON subscription_plans(category);
CREATE INDEX idx_subscription_plans_is_active ON subscription_plans(is_active);

CREATE TABLE pb_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  notes TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN DEFAULT false NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL, -- Renamed from client_record_id
  priority TEXT, -- Consider ENUM
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL, -- Removed date_created
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL -- Removed date_modified
);
-- Add indexes
CREATE INDEX idx_pb_tasks_user_id ON pb_tasks(user_id);
CREATE INDEX idx_pb_tasks_patient_id ON pb_tasks(patient_id);
CREATE INDEX idx_pb_tasks_completed ON pb_tasks(completed);
CREATE INDEX idx_pb_tasks_due_date ON pb_tasks(due_date);

CREATE TABLE pharmacies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  phone TEXT,
  fax TEXT,
  email TEXT,
  website TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
-- Add indexes
CREATE INDEX idx_pharmacies_name ON pharmacies(name);
CREATE INDEX idx_pharmacies_is_active ON pharmacies(is_active);

CREATE TABLE discounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'percentage', -- Added type column (percentage, fixed)
  value DECIMAL(10, 2) NOT NULL DEFAULT 0.00, -- Unified value column
  -- Removed amount and percentage columns
  valid_from TIMESTAMP WITH TIME ZONE, -- Renamed from start_date
  valid_until TIMESTAMP WITH TIME ZONE, -- Renamed from end_date
  requirement TEXT DEFAULT 'None', -- e.g., None, min_purchase, specific_product, new_customer
  min_purchase DECIMAL(10, 2) DEFAULT 0.00,
  status TEXT DEFAULT 'Active', -- Changed from BOOLEAN to TEXT (Active, Inactive, Scheduled, Expired)
  usage_limit INTEGER,
  usage_limit_per_user INTEGER, -- Added limit per user
  usage_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
-- Add indexes
CREATE INDEX idx_discounts_code ON discounts(code);
CREATE INDEX idx_discounts_status ON discounts(status);
CREATE INDEX idx_discounts_valid_until ON discounts(valid_until);

CREATE TABLE questionnaire (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  structure JSONB, -- Stores the form fields/questions
  slug TEXT UNIQUE NOT NULL, -- URL-friendly identifier
  form_type TEXT, -- e.g., 'intake', 'follow-up', 'consent'
  is_active BOOLEAN DEFAULT true NOT NULL, -- Renamed from status
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
-- Add indexes
CREATE INDEX idx_questionnaire_slug ON questionnaire(slug);
CREATE INDEX idx_questionnaire_is_active ON questionnaire(is_active);

CREATE TABLE pb_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL, -- Renamed from client_record_id
  status TEXT DEFAULT 'pending' NOT NULL, -- e.g., pending, paid, partially_paid, refunded, cancelled
  pb_invoice_id TEXT, -- External ID if applicable
  pb_invoice_metadata JSONB,
  notes TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  paid_date TIMESTAMP WITH TIME ZONE,
  invoice_amount DECIMAL(10, 2) DEFAULT 0.00 NOT NULL, -- Added invoice amount
  amount_paid DECIMAL(10, 2) DEFAULT 0.00 NOT NULL, -- Added amount paid
  due_amount DECIMAL(10, 2) DEFAULT 0.00 NOT NULL, -- Added due amount
  refunded BOOLEAN DEFAULT false NOT NULL,
  refunded_amount DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL, -- Removed date_created
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL -- Removed date_modified
);
-- Add indexes
CREATE INDEX idx_pb_invoices_patient_id ON pb_invoices(patient_id);
CREATE INDEX idx_pb_invoices_status ON pb_invoices(status);
CREATE INDEX idx_pb_invoices_due_date ON pb_invoices(due_date);

CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE, -- Renamed, Changed from SET NULL to CASCADE
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- User who wrote the note
  note_type TEXT, -- e.g., 'Consultation', 'Session', 'General'
  title TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
-- Add indexes
CREATE INDEX idx_notes_patient_id ON notes(patient_id);
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_note_type ON notes(note_type);

CREATE TABLE notifications (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- Made NOT NULL
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false NOT NULL,
    link_url TEXT, -- Optional URL to navigate to when notification is clicked
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
-- Add indexes
CREATE INDEX idx_notifications_user_id_is_read ON notifications(user_id, is_read);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE, -- Renamed, Changed from SET NULL to CASCADE
  order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL, -- e.g., pending, processing, shipped, delivered, cancelled, on_hold
  hold_reason TEXT, -- Reason if status is 'on_hold'
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  shipping_address JSONB,
  billing_address JSONB,
  invoice_id UUID REFERENCES pb_invoices(id) ON DELETE SET NULL,
  pharmacy_id UUID REFERENCES pharmacies(id) ON DELETE SET NULL, -- Added pharmacy link
  linked_session_id UUID REFERENCES sessions(id) ON DELETE SET NULL, -- Added session link
  tracking_number TEXT,
  estimated_delivery DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
-- Add indexes
CREATE INDEX idx_orders_patient_id ON orders(patient_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_date ON orders(order_date);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  -- Added product_dose_id if linking to specific doses within a product
  -- product_dose_id UUID, -- This would require doses to be a separate table or handled differently
  description TEXT, -- Store description at time of order (e.g., "Vitamin D 1000IU")
  quantity INTEGER NOT NULL DEFAULT 1,
  price_at_order DECIMAL(10, 2) NOT NULL,
  CONSTRAINT check_order_item_type CHECK (product_id IS NOT NULL OR service_id IS NOT NULL)
);
-- Add indexes
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_order_items_service_id ON order_items(service_id);

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE, -- Renamed, Changed from SET NULL to CASCADE
  provider_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  consultation_id UUID REFERENCES consultations(id) ON DELETE SET NULL,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL, -- Renamed from start_time
  end_time TIMESTAMP WITH TIME ZONE, -- Keep for actual end time if needed
  duration_minutes INTEGER,
  status TEXT DEFAULT 'scheduled' NOT NULL, -- e.g., scheduled, completed, cancelled, no_show, missed
  session_notes TEXT, -- Or link via notes table
  meeting_link TEXT,
  follow_up_needed BOOLEAN DEFAULT FALSE, -- Added flag
  type TEXT, -- Added type (e.g., 'medical', 'psych') - consider linking to services instead?
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
-- Add indexes
CREATE INDEX idx_sessions_patient_id ON sessions(patient_id);
CREATE INDEX idx_sessions_provider_id ON sessions(provider_id);
CREATE INDEX idx_sessions_scheduled_date ON sessions(scheduled_date);
CREATE INDEX idx_sessions_status ON sessions(status);

CREATE TABLE tag (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
-- Add index
CREATE INDEX idx_tag_name ON tag(name);

-- Junction table for patient tags
CREATE TABLE patient_tags (
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tag(id) ON DELETE CASCADE,
  PRIMARY KEY (patient_id, tag_id)
);

-- api_logs table (as defined in combined_schema.sql)
CREATE TABLE api_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  method TEXT,
  path TEXT,
  status_code INTEGER,
  request_body JSONB,
  response_body JSONB,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
-- Add indexes
CREATE INDEX idx_api_logs_user_id ON api_logs(user_id);
CREATE INDEX idx_api_logs_path ON api_logs(path);
CREATE INDEX idx_api_logs_created_at ON api_logs(created_at);

-- frontend_errors table (as defined previously)
CREATE TABLE frontend_errors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  component_context TEXT,
  additional_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
-- Add indexes
CREATE INDEX idx_frontend_errors_user_id ON frontend_errors(user_id);
CREATE INDEX idx_frontend_errors_created_at ON frontend_errors(created_at);

-- Optional: Add comment on the table
COMMENT ON TABLE frontend_errors IS 'Stores errors logged from the frontend application.';
