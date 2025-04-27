-- Sample Data for Service Management Testing
-- Execute this script after applying the 20250426000000_create_service_junction_tables.sql migration
-- Date: April 27, 2025

-- Sample subscription plans (if none exist)
INSERT INTO subscription_plans (id, name, description, price, billing_frequency, category, is_active)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Basic Plan', 'Entry-level healthcare subscription', 29.99, 'monthly', 'Standard', true),
  ('22222222-2222-2222-2222-222222222222', 'Standard Plan', 'Mid-tier healthcare subscription', 49.99, 'monthly', 'Standard', true),
  ('33333333-3333-3333-3333-333333333333', 'Premium Plan', 'Premium healthcare subscription', 99.99, 'monthly', 'Premium', true),
  ('44444444-4444-4444-4444-444444444444', 'Family Plan', 'Healthcare subscription for families', 149.99, 'monthly', 'Family', true),
  ('55555555-5555-5555-5555-555555555555', 'Annual Basic', 'Basic plan with annual billing', 299.99, 'yearly', 'Standard', true)
ON CONFLICT (id) DO NOTHING;

-- Sample products (if none exist)
INSERT INTO products (id, name, description, price, category, type, is_active)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Blood Pressure Monitor', 'Digital blood pressure monitoring device', 59.99, 'Devices', 'Medical Device', true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Glucose Test Strips (50)', 'Pack of 50 glucose test strips', 24.99, 'Supplies', 'Test Supplies', true),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Digital Thermometer', 'Quick-read digital thermometer', 19.99, 'Devices', 'Medical Device', true),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'First Aid Kit', 'Comprehensive first aid kit for home use', 34.99, 'Supplies', 'First Aid', true),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Vitamin D Supplements', '90-day supply of Vitamin D supplements', 29.99, 'Supplements', 'Vitamins', true)
ON CONFLICT (id) DO NOTHING;

-- Sample services
INSERT INTO services (id, name, description, price, duration_minutes, category, is_active, requires_consultation)
VALUES
  ('12345678-1234-1234-1234-123456789012', 'General Health Consultation', 'Basic health consultation with a general practitioner', 75.00, 30, 'General', true, true),
  ('23456789-2345-2345-2345-234567890123', 'Mental Health Assessment', 'Comprehensive mental health evaluation by a licensed therapist', 120.00, 60, 'Mental Health', true, true),
  ('34567890-3456-3456-3456-345678901234', 'Nutritional Counseling', 'Personalized nutrition advice by a registered dietitian', 90.00, 45, 'Nutrition', true, false),
  ('45678901-4567-4567-4567-456789012345', 'Prescription Renewal', 'Quick consultation for prescription renewal', 45.00, 15, 'General', true, true),
  ('56789012-5678-5678-5678-567890123456', 'Lab Test Package', 'Comprehensive blood work and analysis', 180.00, 20, 'Diagnostics', true, false)
ON CONFLICT (id) DO NOTHING;

-- Link services to products
INSERT INTO service_products (service_id, product_id)
VALUES
  ('12345678-1234-1234-1234-123456789012', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), -- General Consultation with Blood Pressure Monitor
  ('12345678-1234-1234-1234-123456789012', 'cccccccc-cccc-cccc-cccc-cccccccccccc'), -- General Consultation with Thermometer
  ('23456789-2345-2345-2345-234567890123', 'dddddddd-dddd-dddd-dddd-dddddddddddd'), -- Mental Health with First Aid Kit
  ('34567890-3456-3456-3456-345678901234', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'), -- Nutrition with Vitamin D
  ('45678901-4567-4567-4567-456789012345', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'), -- Prescription with Glucose Strips
  ('56789012-5678-5678-5678-567890123456', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), -- Lab Test with Blood Pressure Monitor
  ('56789012-5678-5678-5678-567890123456', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb')  -- Lab Test with Glucose Strips
ON CONFLICT DO NOTHING;

-- Link services to subscription plans
INSERT INTO service_plans (service_id, plan_id, duration, requires_subscription)
VALUES
  ('12345678-1234-1234-1234-123456789012', '11111111-1111-1111-1111-111111111111', '30 days', true),  -- General Consultation with Basic Plan
  ('12345678-1234-1234-1234-123456789012', '22222222-2222-2222-2222-222222222222', '30 days', true),  -- General Consultation with Standard Plan
  ('12345678-1234-1234-1234-123456789012', '33333333-3333-3333-3333-333333333333', '30 days', false), -- General Consultation with Premium Plan (optional)
  ('12345678-1234-1234-1234-123456789012', '44444444-4444-4444-4444-444444444444', '30 days', false), -- General Consultation with Family Plan (optional)
  ('23456789-2345-2345-2345-234567890123', '22222222-2222-2222-2222-222222222222', '45 days', true),  -- Mental Health with Standard Plan
  ('23456789-2345-2345-2345-234567890123', '33333333-3333-3333-3333-333333333333', '60 days', true),  -- Mental Health with Premium Plan
  ('34567890-3456-3456-3456-345678901234', '33333333-3333-3333-3333-333333333333', '90 days', false), -- Nutrition with Premium Plan (optional)
  ('45678901-4567-4567-4567-456789012345', '11111111-1111-1111-1111-111111111111', '30 days', true),  -- Prescription with Basic Plan
  ('45678901-4567-4567-4567-456789012345', '22222222-2222-2222-2222-222222222222', '30 days', true),  -- Prescription with Standard Plan
  ('45678901-4567-4567-4567-456789012345', '33333333-3333-3333-3333-333333333333', '30 days', true),  -- Prescription with Premium Plan
  ('56789012-5678-5678-5678-567890123456', '22222222-2222-2222-2222-222222222222', '60 days', true),  -- Lab Test with Standard Plan
  ('56789012-5678-5678-5678-567890123456', '33333333-3333-3333-3333-333333333333', '60 days', true),  -- Lab Test with Premium Plan
  ('56789012-5678-5678-5678-567890123456', '44444444-4444-4444-4444-444444444444', '60 days', true)   -- Lab Test with Family Plan
ON CONFLICT DO NOTHING;

-- Add a comment to notify successful execution
DO $$
BEGIN
    RAISE NOTICE 'Sample service management data has been loaded successfully.';
END $$;