-- Final Optimized Schema File
-- WARNING: Running this script will DROP existing tables and DELETE all data.

-- Drop existing tables in reverse order of dependency, or use CASCADE
DROP TABLE IF EXISTS patient_tags CASCADE;
DROP TABLE IF EXISTS plan_features CASCADE;
DROP TABLE IF EXISTS features CASCADE;
DROP TABLE IF EXISTS plan_doses CASCADE;
DROP TABLE IF EXISTS product_doses CASCADE;
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
DROP TABLE IF EXISTS patients CASCADE; -- Formerly patients
DROP TABLE IF EXISTS patients CASCADE; -- Drop old name just in case
DROP TABLE IF EXISTS test CASCADE; -- Drop test table if it exists

-- Drop ENUM types if they exist (in reverse order of potential dependency)
DROP TYPE IF EXISTS task_priority;
DROP TYPE IF EXISTS session_status;
DROP TYPE IF EXISTS order_status;
DROP TYPE IF EXISTS discount_status;
DROP TYPE IF EXISTS consultation_status;
DROP TYPE IF EXISTS insurance_status;
DROP TYPE IF EXISTS invoice_status;
DROP TYPE IF EXISTS product_stock_status;

-- Ensure the uuid-ossp extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types (Define before tables that use them)
CREATE TYPE consultation_status AS ENUM ('pending', 'scheduled', 'completed', 'cancelled', 'reviewed', 'followup', 'archived');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'on_hold');
CREATE TYPE session_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show', 'missed');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE discount_status AS ENUM ('Active', 'Inactive', 'Scheduled', 'Expired');
CREATE TYPE insurance_status AS ENUM ('Pending', 'Active', 'Inactive', 'Denied', 'Requires Info');
CREATE TYPE invoice_status AS ENUM ('pending', 'paid', 'partially_paid', 'refunded', 'cancelled', 'failed');
CREATE TYPE product_stock_status AS ENUM ('in-stock', 'limited', 'out-of-stock', 'backorder');

-- Create Optimized Tables --

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
CREATE INDEX idx_patients_email ON patients(email);
CREATE INDEX idx_patients_name ON patients(last_name, first_name);

CREATE TABLE insurance_policy (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  provider_name TEXT NOT NULL,
  policy_number TEXT,
  group_number TEXT,
  subscriber_name TEXT,
  subscriber_dob DATE,
  status insurance_status DEFAULT 'Pending', -- Using ENUM
  verification_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_insurance_policy_patient_id ON insurance_policy(patient_id);
CREATE INDEX idx_insurance_policy_status ON insurance_policy(status);

CREATE TABLE insurance_document (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  insurance_policy_id UUID NOT NULL REFERENCES insurance_policy(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  storage_path TEXT UNIQUE NOT NULL,
  url TEXT,
  document_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_insurance_document_policy_id ON insurance_document(insurance_policy_id);

CREATE TABLE consultations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  consultation_type TEXT NOT NULL,
  status consultation_status NOT NULL DEFAULT 'pending', -- Using ENUM
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  provider_notes TEXT,
  client_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_consultations_patient_id ON consultations(patient_id);
CREATE INDEX idx_consultations_status ON consultations(status);
CREATE INDEX idx_consultations_scheduled_at ON consultations(scheduled_at);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT UNIQUE,
  category TEXT,
  type TEXT NOT NULL DEFAULT 'medication', -- medication, supplement, service
  price DECIMAL(10, 2) DEFAULT 0.00, -- Price for non-medication one-time purchase
  one_time_purchase_price DECIMAL(10, 2) DEFAULT 0.00, -- Price for medication one-time purchase (if allowed per dose)
  fulfillment_source TEXT,
  requires_prescription BOOLEAN DEFAULT TRUE,
  interaction_warnings TEXT[],
  stock_status product_stock_status DEFAULT 'in-stock', -- Using ENUM
  image_url TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  stripe_price_id TEXT, -- Stripe Price ID for non-medication one-time purchase
  stripe_one_time_price_id TEXT, -- Stripe Price ID for medication one-time purchase (master ID if not per-dose)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
  -- Removed doses JSONB column
);
CREATE INDEX idx_products_type ON products(type);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_sku ON products(sku);

-- New table for product doses (Created before subscription_plans and order_items)
CREATE TABLE product_doses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  value TEXT NOT NULL, -- e.g., '10mg', '25mg'
  description TEXT,
  allow_one_time_purchase BOOLEAN DEFAULT FALSE, -- If this specific dose can be bought one-time
  stripe_price_id TEXT UNIQUE, -- Stripe Price ID for the subscription dose price
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE (product_id, value) -- Ensure unique dose values per product
);
CREATE INDEX idx_product_doses_product_id ON product_doses(product_id);
CREATE INDEX idx_product_doses_stripe_price_id ON product_doses(stripe_price_id);
CREATE INDEX idx_product_doses_is_active ON product_doses(is_active);

CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  duration_minutes INTEGER,
  category TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_is_active ON services(is_active);

-- New table for features (Created before subscription_plans)
CREATE TABLE features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  billing_frequency TEXT NOT NULL,
  delivery_frequency TEXT,
  discount INTEGER DEFAULT 0,
  category TEXT,
  popularity TEXT DEFAULT 'medium',
  requires_consultation BOOLEAN DEFAULT TRUE,
  additional_benefits TEXT[],
  stripe_price_id TEXT UNIQUE, -- Stripe Price ID for the plan itself
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
  -- Removed features JSONB, allowed_product_doses JSONB
);
CREATE INDEX idx_subscription_plans_category ON subscription_plans(category);
CREATE INDEX idx_subscription_plans_is_active ON subscription_plans(is_active);
CREATE INDEX idx_subscription_plans_stripe_price_id ON subscription_plans(stripe_price_id);

-- New junction table for plan features
CREATE TABLE plan_features (
  plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
  feature_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE,
  PRIMARY KEY (plan_id, feature_id)
);

-- New junction table for plan doses
CREATE TABLE plan_doses (
  plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
  dose_id UUID NOT NULL REFERENCES product_doses(id) ON DELETE CASCADE,
  PRIMARY KEY (plan_id, dose_id)
);

CREATE TABLE pb_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  notes TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN DEFAULT false NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  priority task_priority, -- Using ENUM
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_pb_tasks_user_id ON pb_tasks(user_id);
CREATE INDEX idx_pb_tasks_patient_id ON pb_tasks(patient_id);
CREATE INDEX idx_pb_tasks_completed ON pb_tasks(completed);
CREATE INDEX idx_pb_tasks_due_date ON pb_tasks(due_date);
CREATE INDEX idx_pb_tasks_priority ON pb_tasks(priority);

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
CREATE INDEX idx_pharmacies_name ON pharmacies(name);
CREATE INDEX idx_pharmacies_is_active ON pharmacies(is_active);

CREATE TABLE discounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'percentage', -- percentage, fixed
  value DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  valid_from TIMESTAMP WITH TIME ZONE,
  valid_until TIMESTAMP WITH TIME ZONE,
  requirement TEXT DEFAULT 'None',
  min_purchase DECIMAL(10, 2) DEFAULT 0.00,
  status discount_status DEFAULT 'Active', -- Using ENUM
  usage_limit INTEGER,
  usage_limit_per_user INTEGER,
  usage_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_discounts_code ON discounts(code);
CREATE INDEX idx_discounts_status ON discounts(status);
CREATE INDEX idx_discounts_valid_until ON discounts(valid_until);

CREATE TABLE questionnaire (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  structure JSONB,
  slug TEXT UNIQUE NOT NULL,
  form_type TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_questionnaire_slug ON questionnaire(slug);
CREATE INDEX idx_questionnaire_is_active ON questionnaire(is_active);

CREATE TABLE pb_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  status invoice_status DEFAULT 'pending' NOT NULL, -- Using ENUM
  pb_invoice_id TEXT,
  pb_invoice_metadata JSONB,
  notes TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  paid_date TIMESTAMP WITH TIME ZONE,
  invoice_amount DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
  amount_paid DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
  due_amount DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
  refunded BOOLEAN DEFAULT false NOT NULL,
  refunded_amount DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_pb_invoices_patient_id ON pb_invoices(patient_id);
CREATE INDEX idx_pb_invoices_status ON pb_invoices(status);
CREATE INDEX idx_pb_invoices_due_date ON pb_invoices(due_date);

CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  note_type TEXT,
  title TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_notes_patient_id ON notes(patient_id);
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_note_type ON notes(note_type);

CREATE TABLE notifications (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false NOT NULL,
    link_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
CREATE INDEX idx_notifications_user_id_is_read ON notifications(user_id, is_read);

-- Moved sessions definition before orders
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  consultation_id UUID REFERENCES consultations(id) ON DELETE SET NULL,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  status session_status DEFAULT 'scheduled' NOT NULL, -- Using ENUM
  session_notes TEXT,
  meeting_link TEXT,
  follow_up_needed BOOLEAN DEFAULT FALSE,
  type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_sessions_patient_id ON sessions(patient_id);
CREATE INDEX idx_sessions_provider_id ON sessions(provider_id);
CREATE INDEX idx_sessions_scheduled_date ON sessions(scheduled_date);
CREATE INDEX idx_sessions_status ON sessions(status);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  status order_status DEFAULT 'pending' NOT NULL, -- Using ENUM
  hold_reason TEXT,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  shipping_street_address TEXT, -- Standardized address
  shipping_city TEXT,
  shipping_state TEXT,
  shipping_zip TEXT,
  shipping_country TEXT,
  billing_street_address TEXT, -- Standardized address
  billing_city TEXT,
  billing_state TEXT,
  billing_zip TEXT,
  billing_country TEXT,
  invoice_id UUID REFERENCES pb_invoices(id) ON DELETE SET NULL,
  pharmacy_id UUID REFERENCES pharmacies(id) ON DELETE SET NULL,
  linked_session_id UUID REFERENCES sessions(id) ON DELETE SET NULL, -- Now references sessions correctly
  tracking_number TEXT,
  estimated_delivery DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_orders_patient_id ON orders(patient_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_date ON orders(order_date);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  product_dose_id UUID REFERENCES product_doses(id) ON DELETE SET NULL, -- Link to specific dose if applicable
  description TEXT, -- Store description at time of order
  quantity INTEGER NOT NULL DEFAULT 1,
  price_at_order DECIMAL(10, 2) NOT NULL,
  CONSTRAINT check_order_item_type CHECK (product_id IS NOT NULL OR service_id IS NOT NULL)
);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_order_items_service_id ON order_items(service_id);
CREATE INDEX idx_order_items_product_dose_id ON order_items(product_dose_id);

CREATE TABLE tag (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_tag_name ON tag(name);

CREATE TABLE patient_tags (
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tag(id) ON DELETE CASCADE,
  PRIMARY KEY (patient_id, tag_id)
);

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
CREATE INDEX idx_api_logs_user_id ON api_logs(user_id);
CREATE INDEX idx_api_logs_path ON api_logs(path);
CREATE INDEX idx_api_logs_created_at ON api_logs(created_at);

CREATE TABLE frontend_errors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  component_context TEXT,
  additional_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_frontend_errors_user_id ON frontend_errors(user_id);
CREATE INDEX idx_frontend_errors_created_at ON frontend_errors(created_at);

COMMENT ON TABLE frontend_errors IS 'Stores errors logged from the frontend application.';
