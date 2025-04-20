
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Link to the owning user
  -- Add CHECK constraints for comprehensive validation
  CONSTRAINT email_format_check CHECK (
    email IS NULL OR 
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]+$'
  ),
  CONSTRAINT phone_format_check CHECK (
    phone IS NULL OR 
    phone ~ '^\+?[0-9]{10,15}$'
  ),
  CONSTRAINT date_of_birth_check CHECK (
    date_of_birth IS NULL OR
    date_of_birth BETWEEN '1900-01-01' AND CURRENT_DATE
  ),
  CONSTRAINT zip_format_check CHECK (
    zip IS NULL OR 
    (zip ~ '^\d{5}(-\d{4})?$' AND length(zip) BETWEEN 5 AND 10)
  ),
  CONSTRAINT first_name_not_empty CHECK (
    first_name IS NOT NULL AND 
    first_name != '' AND 
    length(first_name) <= 100
  ),
  CONSTRAINT last_name_not_empty CHECK (
    last_name IS NOT NULL AND 
    last_name != '' AND 
    length(last_name) <= 100
  ),
  CONSTRAINT address_length_check CHECK (
    address IS NULL OR 
    length(address) <= 255
  ),
  CONSTRAINT city_length_check CHECK (
    city IS NULL OR 
    length(city) <= 100
  ),
  CONSTRAINT state_length_check CHECK (
    state IS NULL OR 
    length(state) <= 50
  )
);
CREATE INDEX idx_patients_owner_id ON patients(owner_id);
CREATE INDEX idx_patients_email ON patients(email);
CREATE INDEX idx_patients_name ON patients(last_name, first_name);
CREATE INDEX idx_patients_email ON patients(email);
CREATE INDEX idx_patients_name ON patients(last_name, first_name);

-- Enable RLS for patients table
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Policies for patients table
-- Allow authenticated users to view their own patient record
CREATE POLICY "Allow authenticated users to view their own patients"
ON patients FOR SELECT
TO authenticated
USING (auth.uid() = owner_id);

-- Allow authenticated users to insert their own patient record
CREATE POLICY "Allow authenticated users to insert their own patients"
ON patients FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id);

-- Allow authenticated users to update their own patient record
CREATE POLICY "Allow authenticated users to update their own patients"
ON patients FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id);

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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  -- Add comprehensive validation constraints
  CONSTRAINT provider_name_not_empty CHECK (
    provider_name IS NOT NULL AND 
    provider_name != '' AND 
    length(provider_name) <= 100
  ),
  CONSTRAINT policy_number_required_when_active CHECK (
    status != 'Active' OR 
    (policy_number IS NOT NULL AND policy_number != '')
  ),
  CONSTRAINT subscriber_dob_valid CHECK (
    subscriber_dob IS NULL OR
    subscriber_dob BETWEEN '1900-01-01' AND CURRENT_DATE
  ),
  CONSTRAINT verification_date_valid CHECK (
    verification_date IS NULL OR
    verification_date >= created_at
  ),
  CONSTRAINT status_transition_valid CHECK (
    status != 'Denied' OR 
    (status = 'Denied' AND notes IS NOT NULL)
  ),
  CONSTRAINT notes_length_check CHECK (
    notes IS NULL OR 
    length(notes) <= 1000
  )
);
CREATE INDEX idx_insurance_policy_patient_id ON insurance_policy(patient_id);
CREATE INDEX idx_insurance_policy_status ON insurance_policy(status);

-- Enable RLS for insurance_policy table
ALTER TABLE insurance_policy ENABLE ROW LEVEL SECURITY;

-- Policies for insurance_policy table
-- Allow authenticated users, providers, and admins to view insurance policies based on ownership/management/admin status
CREATE POLICY "Allow access to insurance policies based on role and ownership"
ON insurance_policy FOR SELECT
TO authenticated
USING (
  patient_id IN (
    SELECT p.id
    FROM patients p
    LEFT JOIN provider_patient pp ON pp.patient_id = p.id
    WHERE p.owner_id = auth.uid() -- User's own patients
       OR pp.provider_id = auth.uid() -- Patients managed by the provider
  )
  OR is_admin(auth.uid()) -- Admins can see all
);

-- Allow authenticated users, providers, and admins to insert insurance policies based on role and ownership
CREATE POLICY "Allow insert of insurance policies based on role and ownership"
ON insurance_policy FOR INSERT
TO authenticated
WITH CHECK (
  patient_id IN (
    SELECT p.id
    FROM patients p
    LEFT JOIN provider_patient pp ON pp.patient_id = p.id
    WHERE p.owner_id = auth.uid() -- User's own patients
       OR pp.provider_id = auth.uid() -- Patients managed by the provider
  )
  OR is_admin(auth.uid()) -- Admins can insert all
);

-- Allow authenticated users, providers, and admins to update insurance policies based on role and ownership
CREATE POLICY "Allow update of insurance policies based on role and ownership"
ON insurance_policy FOR UPDATE
TO authenticated
USING (
  patient_id IN (
    SELECT p.id
    FROM patients p
    LEFT JOIN provider_patient pp ON pp.patient_id = p.id
    WHERE p.owner_id = auth.uid() -- User's own patients
       OR pp.provider_id = auth.uid() -- Patients managed by the provider
  )
  OR is_admin(auth.uid()) -- Admins can update all
);

-- Allow providers and admins to delete insurance policies
CREATE POLICY "Allow providers and admins to delete insurance policies"
ON insurance_policy FOR DELETE
TO authenticated -- Assuming providers and admins are authenticated
USING (
  EXISTS (
    SELECT 1
    FROM provider_patient pp
    WHERE pp.patient_id = insurance_policy.patient_id
      AND pp.provider_id = auth.uid() -- Provider managing the patient
  )
  OR is_admin(auth.uid()) -- Admins can delete all
);


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

-- Enable RLS for insurance_document table
ALTER TABLE insurance_document ENABLE ROW LEVEL SECURITY;

-- Policies for insurance_document table
-- Allow authenticated users, providers, and admins to view insurance documents based on access to the parent policy
CREATE POLICY "Allow access to insurance documents based on parent policy access"
ON insurance_document FOR SELECT
TO authenticated
USING (insurance_policy_id IN (SELECT id FROM insurance_policy WHERE
  patient_id IN (
    SELECT p.id
    FROM patients p
    LEFT JOIN provider_patient pp ON pp.patient_id = p.id
    WHERE p.owner_id = auth.uid() -- User's own patients
       OR pp.provider_id = auth.uid() -- Patients managed by the provider
  )
  OR is_admin(auth.uid()) -- Admins can see all policies
));

-- Allow providers and admins to insert insurance documents
CREATE POLICY "Allow providers and admins to insert insurance documents"
ON insurance_document FOR INSERT
TO authenticated -- Assuming providers are authenticated
WITH CHECK (
  insurance_policy_id IN (SELECT id FROM insurance_policy WHERE
    patient_id IN (
      SELECT pp.patient_id
      FROM provider_patient pp
      WHERE pp.provider_id = auth.uid() -- Policies for patients managed by the provider
    )
    OR is_admin(auth.uid()) -- Admins can insert for any policy
  )
);

-- Allow providers and admins to update insurance documents
CREATE POLICY "Allow providers and admins to update insurance documents"
ON insurance_document FOR UPDATE
TO authenticated -- Assuming providers are authenticated
USING (
  insurance_policy_id IN (SELECT id FROM insurance_policy WHERE
    patient_id IN (
      SELECT pp.patient_id
      FROM provider_patient pp
      WHERE pp.provider_id = auth.uid() -- Policies for patients managed by the provider
    )
    OR is_admin(auth.uid()) -- Admins can update for any policy
  )
);

-- Allow providers and admins to delete insurance documents
CREATE POLICY "Allow providers and admins to delete insurance documents"
ON insurance_document FOR DELETE
TO authenticated -- Assuming providers and admins are authenticated
USING (
  insurance_policy_id IN (SELECT id FROM insurance_policy WHERE
    patient_id IN (
      SELECT pp.patient_id
      FROM provider_patient pp
      WHERE pp.provider_id = auth.uid() -- Policies for patients managed by the provider
    )
    OR is_admin(auth.uid()) -- Admins can delete for any policy
  )
);

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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  -- Add comprehensive validation constraints
  CONSTRAINT consultation_type_not_empty CHECK (
    consultation_type IS NOT NULL AND 
    consultation_type != '' AND 
    length(consultation_type) <= 100
  ),
  CONSTRAINT scheduled_at_required_when_scheduled CHECK (
    status != 'scheduled' OR 
    scheduled_at IS NOT NULL
  ),
  CONSTRAINT completed_at_valid CHECK (
    completed_at IS NULL OR
    (scheduled_at IS NOT NULL AND completed_at >= scheduled_at)
  ),
  CONSTRAINT status_transition_valid CHECK (
    (status != 'completed' OR 
      (status = 'completed' AND completed_at IS NOT NULL)) AND
    (status != 'cancelled' OR 
      (status = 'cancelled' AND provider_notes IS NOT NULL))
  ),
  CONSTRAINT provider_notes_length CHECK (
    provider_notes IS NULL OR 
    length(provider_notes) <= 2000
  ),
  CONSTRAINT client_notes_length CHECK (
    client_notes IS NULL OR 
    length(client_notes) <= 2000
  )
);
CREATE INDEX idx_consultations_patient_id ON consultations(patient_id);
CREATE INDEX idx_consultations_status ON consultations(status);
CREATE INDEX idx_consultations_scheduled_at ON consultations(scheduled_at);

-- Enable RLS for consultations table
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

-- Policies for consultations table
-- Allow authenticated users to view their own consultations (via patient ownership)
CREATE POLICY "Allow authenticated users to view their own consultations"
ON consultations FOR SELECT
TO authenticated
USING (patient_id IN (SELECT id FROM patients WHERE owner_id = auth.uid()));

-- Allow providers to access consultations where they are the provider
CREATE POLICY "Allow providers to access their assigned consultations"
ON consultations FOR SELECT
TO authenticated -- Assuming providers are authenticated
USING (provider_id = auth.uid());

-- Allow providers to insert consultations
CREATE POLICY "Allow providers to insert consultations"
ON consultations FOR INSERT
TO authenticated -- Assuming providers are authenticated
WITH CHECK (provider_id = auth.uid()); -- Ensure provider is setting themselves as the provider

-- Allow providers to update consultations where they are the provider
CREATE POLICY "Allow providers to update their assigned consultations"
ON consultations FOR UPDATE
TO authenticated -- Assuming providers are authenticated
USING (provider_id = auth.uid());

-- Allow admins full access to consultations
CREATE POLICY "Allow admins full access to consultations"
ON consultations FOR ALL
TO authenticated -- Assuming admins are authenticated
USING (is_admin(auth.uid()));

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

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  status order_status DEFAULT 'pending' NOT NULL,
  total_amount DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
  tax_amount DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
  shipping_amount DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
  payment_method TEXT,
  payment_status TEXT,
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_state TEXT,
  shipping_zip TEXT,
  shipping_country TEXT,
  tracking_number TEXT,
  shipped_date TIMESTAMP WITH TIME ZONE,
  delivered_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  -- Comprehensive validation constraints
  CONSTRAINT total_amount_non_negative CHECK (total_amount >= 0),
  CONSTRAINT tax_amount_non_negative CHECK (tax_amount >= 0),
  CONSTRAINT discount_amount_non_negative CHECK (discount_amount >= 0),
  CONSTRAINT shipping_amount_non_negative CHECK (shipping_amount >= 0),
  CONSTRAINT shipped_date_valid CHECK (
    shipped_date IS NULL OR 
    (shipped_date >= created_at AND (delivered_date IS NULL OR shipped_date <= delivered_date))
  ),
  CONSTRAINT delivered_date_valid CHECK (
    delivered_date IS NULL OR 
    (delivered_date >= created_at AND (shipped_date IS NOT NULL OR status = 'delivered'))
  ),
  CONSTRAINT status_transition_valid CHECK (
    (status != 'shipped' OR shipped_date IS NOT NULL) AND
    (status != 'delivered' OR delivered_date IS NOT NULL) AND
    (status != 'cancelled' OR notes IS NOT NULL)
  ),
  CONSTRAINT shipping_zip_format CHECK (
    shipping_zip IS NULL OR 
    (shipping_zip ~ '^\d{5}(-\d{4})?$' AND length(shipping_zip) BETWEEN 5 AND 10)
  ),
  CONSTRAINT notes_length CHECK (notes IS NULL OR length(notes) <= 2000)
);
CREATE INDEX idx_orders_patient_id ON orders(patient_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Enable RLS for orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policies for orders table
-- Allow authenticated users to view their own orders
CREATE POLICY "Allow authenticated users to view their own orders"
ON orders FOR SELECT
TO authenticated
USING (patient_id IN (SELECT id FROM patients WHERE owner_id = auth.uid()));

-- Allow authenticated users to insert their own orders
CREATE POLICY "Allow authenticated users to insert their own orders"
ON orders FOR INSERT
TO authenticated
WITH CHECK (patient_id IN (SELECT id FROM patients WHERE owner_id = auth.uid()));

-- Allow providers to view orders for their patients
CREATE POLICY "Allow providers to view orders for their patients"
ON orders FOR SELECT
TO authenticated
USING (
  patient_id IN (
    SELECT pp.patient_id
    FROM provider_patient pp
    WHERE pp.provider_id = auth.uid()
  )
);

-- Allow admins full access to orders
CREATE POLICY "Allow admins full access to orders"
ON orders FOR ALL
TO authenticated
USING (is_admin(auth.uid()));

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  product_dose_id UUID REFERENCES product_doses(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0.00,
  status TEXT DEFAULT 'pending',
  fulfillment_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  -- Comprehensive validation constraints
  CONSTRAINT quantity_positive CHECK (quantity > 0),
  CONSTRAINT unit_price_positive CHECK (unit_price >= 0),
  CONSTRAINT discount_amount_valid CHECK (
    discount_amount >= 0 AND 
    discount_amount <= (unit_price * quantity)
  ),
  CONSTRAINT fulfillment_date_valid CHECK (
    fulfillment_date IS NULL OR
    fulfillment_date >= created_at
  ),
  CONSTRAINT status_valid CHECK (
    status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')
  ),
  CONSTRAINT dose_consistency CHECK (
    (product_dose_id IS NULL) OR 
    (product_dose_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM product_doses 
      WHERE id = product_dose_id AND product_id = order_items.product_id
    ))
  )
);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_order_items_status ON order_items(status);

-- Enable RLS for order_items table
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Policies for order_items table
-- Allow authenticated users to view their own order items
CREATE POLICY "Allow authenticated users to view their own order items"
ON order_items FOR SELECT
TO authenticated
USING (order_id IN (SELECT id FROM orders WHERE patient_id IN (
  SELECT id FROM patients WHERE owner_id = auth.uid()
)));

-- Allow authenticated users to insert their own order items
CREATE POLICY "Allow authenticated users to insert their own order items"
ON order_items FOR INSERT
TO authenticated
WITH CHECK (order_id IN (SELECT id FROM orders WHERE patient_id IN (
  SELECT id FROM patients WHERE owner_id = auth.uid()
)));

-- Allow providers to view order items for their patients
CREATE POLICY "Allow providers to view order items for their patients"
ON order_items FOR SELECT
TO authenticated
USING (order_id IN (
  SELECT o.id FROM orders o
  JOIN provider_patient pp ON pp.patient_id = o.patient_id
  WHERE pp.provider_id = auth.uid()
));

-- Allow admins full access to order items
CREATE POLICY "Allow admins full access to order items"
ON order_items FOR ALL
TO authenticated
USING (is_admin(auth.uid()));

-- Webhook logs table for tracking incoming webhook requests
CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  method TEXT NOT NULL,
  headers JSONB NOT NULL,
  body TEXT,
  received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE,
  status_code INTEGER,
  response_body TEXT
);

-- Enable RLS for webhook_logs table
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- Only allow admins to access webhook logs
CREATE POLICY "Allow admins full access to webhook logs"
ON webhook_logs FOR ALL
TO authenticated
USING (is_admin(auth.uid()));
