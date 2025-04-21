1. api_logs
CREATE TABLE public.api_logs (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  method TEXT NULL,
  path TEXT NULL,
  status_code INTEGER NULL,
  request_body JSONB NULL,
  response_body JSONB NULL,
  ip_address INET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);
CREATE INDEX idx_api_logs_user_id ON public.api_logs USING btree (user_id);
CREATE INDEX idx_api_logs_path ON public.api_logs USING btree (path);
CREATE INDEX idx_api_logs_created_at ON public.api_logs USING btree (created_at);

2. consultations
CREATE TABLE public.consultations (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  consultation_type TEXT NOT NULL,
  status public.consultation_status NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  scheduled_at TIMESTAMP WITH TIME ZONE NULL,
  completed_at TIMESTAMP WITH TIME ZONE NULL,
  provider_notes TEXT NULL,
  client_notes TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);
CREATE INDEX idx_consultations_patient_id ON public.consultations USING btree (patient_id);
CREATE INDEX idx_consultations_status ON public.consultations USING btree (status);
CREATE INDEX idx_consultations_scheduled_at ON public.consultations USING btree (scheduled_at);

3. discounts
CREATE TABLE public.discounts (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT NULL,
  discount_type TEXT NOT NULL DEFAULT 'percentage',
  value DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  valid_from TIMESTAMP WITH TIME ZONE NULL,
  valid_until TIMESTAMP WITH TIME ZONE NULL,
  requirement TEXT DEFAULT 'None',
  min_purchase DECIMAL(10, 2) DEFAULT 0.00,
  status public.discount_status DEFAULT 'Active',
  usage_limit INTEGER NULL,
  usage_limit_per_user INTEGER NULL,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);
CREATE INDEX idx_discounts_code ON public.discounts USING btree (code);
CREATE INDEX idx_discounts_status ON public.discounts USING btree (status);
CREATE INDEX idx_discounts_valid_until ON public.discounts USING btree (valid_until);

4. features
CREATE TABLE public.features (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

5. frontend_errors
CREATE TABLE public.frontend_errors (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  error_message TEXT NOT NULL,
  stack_trace TEXT NULL,
  component_context TEXT NULL,
  additional_details JSONB NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);
CREATE INDEX idx_frontend_errors_user_id ON public.frontend_errors USING btree (user_id);
CREATE INDEX idx_frontend_errors_created_at ON public.frontend_errors USING btree (created_at);

6. insurance_document
CREATE TABLE public.insurance_document (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  insurance_policy_id UUID NOT NULL REFERENCES insurance_policy(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL UNIQUE,
  url TEXT NULL,
  document_type TEXT NULL,
  uploaded_by UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);
CREATE INDEX idx_insurance_document_policy_id ON public.insurance_document USING btree (insurance_policy_id);

7. insurance_policy

CREATE TABLE public.insurance_policy (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  provider_name TEXT NOT NULL,
  policy_number TEXT NULL,
  group_number TEXT NULL,
  subscriber_name TEXT NULL,
  subscriber_dob DATE NULL,
  status public.insurance_status DEFAULT 'Pending',
  verification_date TIMESTAMP WITH TIME ZONE NULL,
  notes TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);
CREATE INDEX idx_insurance_policy_patient_id ON public.insurance_policy USING btree (patient_id);
CREATE INDEX idx_insurance_policy_status ON public.insurance_policy USING btree (status);

8. notes
CREATE TABLE public.notes (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  user_id UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  note_type TEXT NULL,
  title TEXT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);
CREATE INDEX idx_notes_patient_id ON public.notes USING btree (patient_id);
CREATE INDEX idx_notes_user_id ON public.notes USING btree (user_id);
CREATE INDEX idx_notes_note_type ON public.notes USING btree (note_type);

9. notifications

CREATE TABLE public.notifications (
  id BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  link_url TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);
CREATE INDEX idx_notifications_user_id_is_read ON public.notifications USING btree (user_id, is_read);

10. order_items

CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NULL REFERENCES products(id) ON DELETE SET NULL,
  service_id UUID NULL REFERENCES services(id) ON DELETE SET NULL,
  product_dose_id UUID NULL REFERENCES product_doses(id) ON DELETE SET NULL,
  description TEXT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price_at_order DECIMAL(10, 2) NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT check_order_item_type CHECK (product_id IS NOT NULL OR service_id IS NOT NULL)
);
CREATE INDEX idx_order_items_order_id ON public.order_items USING btree (order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items USING btree (product_id);
CREATE INDEX idx_order_items_service_id ON public.order_items USING btree (service_id);
CREATE INDEX idx_order_items_product_dose_id ON public.order_items USING btree (product_dose_id);

11. orders
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  order_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status public.order_status NOT NULL DEFAULT 'pending',
  hold_reason TEXT NULL,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  shipping_street_address TEXT NULL,
  shipping_city TEXT NULL,
  shipping_state TEXT NULL,
  shipping_zip TEXT NULL,
  shipping_country TEXT NULL,
  billing_street_address TEXT NULL,
  billing_city TEXT NULL,
  billing_state TEXT NULL,
  billing_zip TEXT NULL,
  billing_country TEXT NULL,
  invoice_id UUID NULL REFERENCES pb_invoices(id) ON DELETE SET NULL,
  pharmacy_id UUID NULL REFERENCES pharmacies(id) ON DELETE SET NULL,
  linked_session_id UUID NULL REFERENCES sessions(id) ON DELETE SET NULL,
  tracking_number TEXT NULL,
  estimated_delivery DATE NULL,
  notes TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);
CREATE INDEX idx_orders_patient_id ON public.orders USING btree (patient_id);
CREATE INDEX idx_orders_status ON public.orders USING btree (status);
CREATE INDEX idx_orders_order_date ON public.orders USING btree (order_date);

12. patient_tags
CREATE TABLE public.patient_tags (
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tag(id) ON DELETE CASCADE,
  PRIMARY KEY (patient_id, tag_id)
);

13. patients
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT NULL,
  date_of_birth DATE NULL,
  address TEXT NULL,
  city TEXT NULL,
  state TEXT NULL,
  zip TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);
CREATE INDEX idx_patients_email ON public.patients USING btree (email);
CREATE INDEX idx_patients_name ON public.patients USING btree (last_name, first_name);

14. pb_invoices
CREATE TABLE public.pb_invoices (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  patient_id UUID NULL REFERENCES patients(id) ON DELETE SET NULL,
  status public.invoice_status NOT NULL DEFAULT 'pending',
  pb_invoice_id TEXT NULL,
  pb_invoice_metadata JSONB NULL,
  notes TEXT NULL,
  due_date TIMESTAMP WITH TIME ZONE NULL,
  paid_date TIMESTAMP WITH TIME ZONE NULL,
  invoice_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  amount_paid DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  due_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  refunded BOOLEAN NOT NULL DEFAULT false,
  refunded_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);
CREATE INDEX idx_pb_invoices_patient_id ON public.pb_invoices USING btree (patient_id);
CREATE INDEX idx_pb_invoices_status ON public.pb_invoices USING btree (status);
CREATE INDEX idx_pb_invoices_due_date ON public.pb_invoices USING btree (due_date);

15. pb_tasks
CREATE TABLE public.pb_tasks (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  title TEXT NOT NULL,
  notes TEXT NULL,
  due_date TIMESTAMP WITH TIME ZONE NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  user_id UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  patient_id UUID NULL REFERENCES patients(id) ON DELETE SET NULL,
  priority public.task_priority NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);
CREATE INDEX idx_pb_tasks_user_id ON public.pb_tasks USING btree (user_id);
CREATE INDEX idx_pb_tasks_patient_id ON public.pb_tasks USING btree (patient_id);
CREATE INDEX idx_pb_tasks_completed ON public.pb_tasks USING btree (completed);
CREATE INDEX idx_pb_tasks_due_date ON public.pb_tasks USING btree (due_date);
CREATE INDEX idx_pb_tasks_priority ON public.pb_tasks USING btree (priority);

16. pharmacies

CREATE TABLE public.pharmacies (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NULL,
  city TEXT NULL,
  state TEXT NULL,
  zip TEXT NULL,
  phone TEXT NULL,
  fax TEXT NULL,
  email TEXT NULL,
  website TEXT NULL,
  notes TEXT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);
CREATE INDEX idx_pharmacies_name ON public.pharmacies USING btree (name);
CREATE INDEX idx_pharmacies_is_active ON public.pharmacies USING btree (is_active);

17. plan_doses
CREATE TABLE public.plan_doses (
  plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
  dose_id UUID NOT NULL REFERENCES product_doses(id) ON DELETE CASCADE,
  PRIMARY KEY (plan_id, dose_id)
);

18. plan_features
CREATE TABLE public.plan_features (
  plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
  feature_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE,
  PRIMARY KEY (plan_id, feature_id)
);

19. product_doses

CREATE TABLE public.product_doses (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  description TEXT NULL,
  allow_one_time_purchase BOOLEAN DEFAULT false,
  stripe_price_id TEXT UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);
CREATE INDEX idx_product_doses_product_id ON public.product_doses USING btree (product_id);
CREATE INDEX idx_product_doses_stripe_price_id ON public.product_doses USING btree (stripe_price_id);
CREATE INDEX idx_product_doses_is_active ON public.product_doses USING btree (is_active);

20. products

CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NULL,
  sku TEXT UNIQUE,
  category TEXT NULL,
  type TEXT NOT NULL DEFAULT 'medication',
  price DECIMAL(10, 2) DEFAULT 0.00,
  one_time_purchase_price DECIMAL(10, 2) DEFAULT 0.00,
  fulfillment_source TEXT NULL,
  requires_prescription BOOLEAN DEFAULT true,
  interaction_warnings TEXT[] NULL,
  stock_status public.product_stock_status DEFAULT 'in-stock',
  image_url TEXT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  stripe_price_id TEXT NULL,
  stripe_one_time_price_id TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);
CREATE INDEX idx_products_type ON public.products USING btree (type);
CREATE INDEX idx_products_category ON public.products USING btree (category);
CREATE INDEX idx_products_is_active ON public.products USING btree (is_active);
CREATE INDEX idx_products_sku ON public.products USING btree (sku);

21. questionnaire

CREATE TABLE public.questionnaire (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NULL,
  structure JSONB NULL,
  slug TEXT NOT NULL UNIQUE,
  form_type TEXT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);
CREATE INDEX idx_questionnaire_slug ON public.questionnaire USING btree (slug);
CREATE INDEX idx_questionnaire_is_active ON public.questionnaire USING btree (is_active);

CREATE
 
TABLE
 public.api_logs (
  id UUID 
NOT
 
NULL
 
DEFAULT
 extensions.uuid_generate_v4(),
  user_id UUID 
NULL
 
REFERENCES
 auth.users(id) 
ON
 
DELETE
 
SET
 
NULL
,
  
method
 TEXT 
NULL
,
  path TEXT 
NULL
,
  status_code 
INTEGER
 
NULL
,
  request_body JSONB 
NULL
,
  response_body JSONB 
NULL
,
  ip_address INET 
NULL
,
  created_at 
TIMESTAMP
 
WITH
 
TIME
 ZONE 
NOT
 
NULL
 
DEFAULT
 now(),
  
PRIMARY
 KEY (id)
);
CREATE
 INDEX idx_api_logs_user_id 
ON
 public.api_logs 
USING
 btree (user_id);
CREATE
 INDEX idx_api_logs_path 
ON
 public.api_logs 
USING
 btree (path);
CREATE
 INDEX idx_api_logs_created_at 
ON
 public.api_logs 
USING
 btree (created_at);