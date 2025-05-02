-- Create missing subscription-related tables

-- Create subscription_duration table
CREATE TABLE IF NOT EXISTS subscription_duration (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  duration_months INTEGER NOT NULL,
  discount_percent DECIMAL(5, 2) DEFAULT 0.00 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create treatment_package table
CREATE TABLE IF NOT EXISTS treatment_package (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  condition TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  base_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create package_service junction table
CREATE TABLE IF NOT EXISTS package_service (
  package_id UUID NOT NULL REFERENCES treatment_package(id) ON DELETE CASCADE,
  service_id UUID NOT NULL,
  PRIMARY KEY (package_id, service_id)
);

-- Create patient_subscription table
CREATE TABLE IF NOT EXISTS patient_subscription (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES treatment_package(id) ON DELETE RESTRICT,
  duration_id UUID NOT NULL REFERENCES subscription_duration(id) ON DELETE RESTRICT,
  stripe_subscription_id TEXT,
  status TEXT DEFAULT 'active' NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_subscription_duration_name ON subscription_duration(name);
CREATE INDEX idx_treatment_package_name ON treatment_package(name);
CREATE INDEX idx_treatment_package_condition ON treatment_package(condition);
CREATE INDEX idx_treatment_package_is_active ON treatment_package(is_active);
CREATE INDEX idx_patient_subscription_patient_id ON patient_subscription(patient_id);
CREATE INDEX idx_patient_subscription_status ON patient_subscription(status);