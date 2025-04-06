-- Insert sample client records
INSERT INTO client_record (first_name, last_name, email, phone, date_of_birth, address, city, state, zip)
VALUES
  ('John', 'Doe', 'john.doe@example.com', '555-123-4567', '1980-01-15', '123 Main St', 'Anytown', 'CA', '90210'),
  ('Jane', 'Smith', 'jane.smith@example.com', '555-987-6543', '1992-05-22', '456 Oak Ave', 'Somewhere', 'NY', '10001'),
  ('Michael', 'Johnson', 'michael.j@example.com', '555-555-5555', '1975-11-30', '789 Pine Rd', 'Elsewhere', 'TX', '75001')
ON CONFLICT (email) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, description, price, category, sku, inventory_count)
VALUES
  ('Vitamin D Supplement', 'High-quality vitamin D supplement, 60 capsules', 24.99, 'Supplements', 'VIT-D-001', 100),
  ('Blood Pressure Monitor', 'Digital blood pressure monitor for home use', 89.99, 'Devices', 'BP-MON-002', 50),
  ('Allergy Medication', 'Non-drowsy allergy relief, 30 tablets', 19.99, 'Medications', 'ALG-MED-003', 75)
ON CONFLICT (sku) DO NOTHING;

-- Insert sample services
INSERT INTO services (name, description, price, duration, category)
VALUES
  ('Initial Consultation', 'Comprehensive first-time patient consultation', 150.00, 60, 'Consultations'),
  ('Follow-up Visit', 'Regular check-in with healthcare provider', 75.00, 30, 'Consultations'),
  ('Medication Review', 'Detailed review of current medications', 50.00, 20, 'Pharmacy Services')
ON CONFLICT DO NOTHING;

-- Insert sample subscription plans
INSERT INTO subscription_plans (name, description, price, billing_cycle, features)
VALUES
  ('Basic Care', 'Essential telehealth services', 29.99, 'monthly', '{"features": ["Unlimited messaging", "2 video consultations per month", "Prescription management"]}'),
  ('Family Plan', 'Coverage for up to 4 family members', 79.99, 'monthly', '{"features": ["Unlimited messaging", "6 video consultations per month", "Prescription management", "Family health records"]}'),
  ('Premium Care', 'Comprehensive healthcare coverage', 99.99, 'monthly', '{"features": ["Unlimited messaging", "Unlimited video consultations", "Priority scheduling", "Prescription management", "Specialist referrals"]}')
ON CONFLICT DO NOTHING;

-- Insert sample pharmacies
INSERT INTO pharmacies (name, address, city, state, zip, phone, fax)
VALUES
  ('MedExpress Pharmacy', '100 Health Blvd', 'Wellness', 'CA', '92101', '555-111-2222', '555-111-2223'),
  ('Community Care Pharmacy', '200 Healing St', 'Carewell', 'NY', '10002', '555-333-4444', '555-333-4445'),
  ('QuickScript Pharmacy', '300 Medicine Ave', 'Healthville', 'TX', '75002', '555-666-7777', '555-666-7778')
ON CONFLICT DO NOTHING;

-- Insert sample tags for tag management
INSERT INTO tags (name, color)
VALUES
  ('Urgent', 'red'),
  ('Follow-up', 'blue'),
  ('New Patient', 'green'),
  ('Medication', 'purple'),
  ('Insurance', 'yellow'),
  ('Billing', 'orange')
ON CONFLICT DO NOTHING;

-- Insert sample consultations
INSERT INTO consultations (client_id, consultation_type, status, dateScheduled)
SELECT 
  id, 
  'Initial Consultation', 
  'pending', 
  NOW() + (RANDOM() * INTERVAL '10 days')
FROM client_record
LIMIT 3
ON CONFLICT DO NOTHING;