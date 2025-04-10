-- Combined schema from migrations

-- Ensure the uuid-ossp extension is enabled (required by multiple tables)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create client_record table (from 20240322000001)
CREATE TABLE IF NOT EXISTS client_record (
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
  insurance_provider TEXT,
  insurance_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create consultations table (from 20240322000001)
CREATE TABLE IF NOT EXISTS consultations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id), -- Changed client_id to patient_id and reference to patients(id)
  consultation_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  dateSubmitted TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  dateScheduled TIMESTAMP WITH TIME ZONE,
  dateCompleted TIMESTAMP WITH TIME ZONE,
  provider_notes TEXT,
  client_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table (from 20240322000008)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  sku TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create services table (from 20240322000008)
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  duration INTEGER, -- Duration in minutes
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscription_plans table (from 20240322000008)
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  billing_cycle TEXT NOT NULL, -- monthly, quarterly, yearly
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create test table (from 20240322000008)
CREATE TABLE IF NOT EXISTS test (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pb_tasks table (from 20240322000009)
-- Note: Assumes 'user' table exists in auth schema
CREATE TABLE IF NOT EXISTS pb_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  notes TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL, -- Changed client_record_id to patient_id and reference to patients(id)
  priority TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pharmacies table (from 20240322000011)
CREATE TABLE IF NOT EXISTS pharmacies (
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
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create discounts table (from 20240322000012)
CREATE TABLE IF NOT EXISTS discounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  status BOOLEAN DEFAULT true,
  amount DECIMAL(10, 2),
  percentage INTEGER,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create questionnaire table (from 20240322000013)
CREATE TABLE IF NOT EXISTS questionnaire (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  structure JSONB,
  status BOOLEAN DEFAULT true,
  form_type TEXT,
  slug TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create insurance_records table (from 20240322000014)
CREATE TABLE IF NOT EXISTS insurance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL, -- Changed client_record_id to patient_id and reference to patients(id)
  provider_name TEXT NOT NULL,
  policy_number TEXT,
  group_number TEXT,
  subscriber_name TEXT,
  subscriber_dob DATE,
  status TEXT DEFAULT 'Pending',
  verification_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create insurance_documents table (from 20240322000014)
-- Note: Assumes 'auth.users' table exists
CREATE TABLE IF NOT EXISTS insurance_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  insurance_record_id UUID REFERENCES insurance_records(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  storage_path TEXT UNIQUE NOT NULL,
  url TEXT,
  document_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pb_invoices table (from 20240322000015)
CREATE TABLE IF NOT EXISTS pb_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL, -- Changed client_record_id to patient_id and reference to patients(id)
  status TEXT DEFAULT 'pending',
  pb_invoice_id TEXT,
  pb_invoice_metadata JSONB,
  notes TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  paid_date TIMESTAMP WITH TIME ZONE,
  refunded BOOLEAN DEFAULT false,
  refunded_amount DECIMAL(10, 2) DEFAULT 0,
  date_created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notes table (from 20240322000016)
-- Note: Assumes 'auth.users' table exists
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE, -- Changed client_record_id to patient_id and reference to patients(id)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  note_type TEXT,
  title TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table (from 20240322000017)
-- Note: Assumes 'auth.users' table exists
CREATE TABLE public.notifications (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    message text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    link_url text
);

-- Create orders table (Proposed)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL, -- Changed client_record_id to patient_id and reference to patients(id)
  order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'pending', -- e.g., pending, processing, shipped, completed, cancelled
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  shipping_address JSONB, -- Could store address details or reference client_record
  billing_address JSONB,
  invoice_id UUID REFERENCES pb_invoices(id) ON DELETE SET NULL, -- Optional link to invoice
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table (Proposed Junction Table)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price_at_order DECIMAL(10, 2) NOT NULL, -- Price when the order was placed
  CONSTRAINT check_item_type CHECK (product_id IS NOT NULL OR service_id IS NOT NULL) -- Ensure at least one item type is linked
);

-- Create sessions table (Proposed)
-- Note: Assumes 'auth.users' table exists for provider_id
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL, -- Changed client_record_id to patient_id and reference to patients(id)
  provider_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Link to the provider/user conducting the session
  service_id UUID REFERENCES services(id) ON DELETE SET NULL, -- Optional link to the specific service provided
  consultation_id UUID REFERENCES consultations(id) ON DELETE SET NULL, -- Optional link to a related consultation
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER, -- Calculated or set duration
  status TEXT DEFAULT 'scheduled', -- e.g., scheduled, in-progress, completed, cancelled, no-show
  session_notes TEXT, -- Or link to the notes table
  meeting_link TEXT, -- Link for video call, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime for new tables (Proposed)
ALTER PUBLICATION supabase_realtime ADD TABLE "order"; -- Renamed
ALTER PUBLICATION supabase_realtime ADD TABLE order_item; -- Renamed
ALTER PUBLICATION supabase_realtime ADD TABLE "session"; -- Renamed

-- Create tag table (Proposed based on errors)
CREATE TABLE IF NOT EXISTS tag (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT, -- Optional color coding
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime for tag table (Proposed)
-- ALTER PUBLICATION supabase_realtime ADD TABLE tag; -- Assuming already added or handled

-- Create api_logs table (Proposed based on errors)
CREATE TABLE IF NOT EXISTS api_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  method TEXT, -- e.g., GET, POST, PUT, DELETE
  path TEXT,
  status_code INTEGER,
  request_body JSONB,
  response_body JSONB,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime for api_logs table (Optional, depends on use case)
-- ALTER PUBLICATION supabase_realtime ADD TABLE api_logs;
