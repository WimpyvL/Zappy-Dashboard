-- Insert sample data

-- Sample users
INSERT INTO "user" (id, email, password_hash, first_name, last_name)
VALUES 
  (uuid_generate_v4(), 'admin@example.com', '$2a$10$hACwQ5/HQI6FhbIISOUVeusy3sKyUDhSq36fF5d/54aULe9Vg5WNi', 'Admin', 'User'),
  (uuid_generate_v4(), 'provider@example.com', '$2a$10$hACwQ5/HQI6FhbIISOUVeusy3sKyUDhSq36fF5d/54aULe9Vg5WNi', 'Provider', 'User')
ON CONFLICT (email) DO NOTHING;

-- Sample clients
INSERT INTO client_record (id, first_name, last_name, email, phone, date_of_birth, address, city, state, zip)
VALUES
  (uuid_generate_v4(), 'John', 'Doe', 'john.doe@example.com', '555-123-4567', '1980-01-15', '123 Main St', 'Anytown', 'CA', '12345'),
  (uuid_generate_v4(), 'Jane', 'Smith', 'jane.smith@example.com', '555-987-6543', '1985-05-20', '456 Oak Ave', 'Somewhere', 'NY', '67890'),
  (uuid_generate_v4(), 'Bob', 'Johnson', 'bob.johnson@example.com', '555-555-5555', '1975-11-30', '789 Pine Rd', 'Nowhere', 'TX', '54321')
ON CONFLICT DO NOTHING;

-- Sample products
INSERT INTO products (id, name, description, price)
VALUES
  (uuid_generate_v4(), 'Medication A', 'Description for Medication A', 49.99),
  (uuid_generate_v4(), 'Medication B', 'Description for Medication B', 79.99),
  (uuid_generate_v4(), 'Supplement C', 'Description for Supplement C', 29.99)
ON CONFLICT DO NOTHING;

-- Sample services
INSERT INTO services (id, name, description, price)
VALUES
  (uuid_generate_v4(), 'Initial Consultation', 'First-time patient consultation', 150.00),
  (uuid_generate_v4(), 'Follow-up Visit', 'Regular follow-up appointment', 75.00),
  (uuid_generate_v4(), 'Lab Review', 'Review of laboratory results', 50.00)
ON CONFLICT DO NOTHING;

-- Sample pharmacies
INSERT INTO pharmacies (id, name, address, city, state, zip, phone, contact_email, supported_states)
VALUES
  (uuid_generate_v4(), 'Main Street Pharmacy', '100 Main St', 'Cityville', 'CA', '12345', '555-111-2222', 'contact@mainpharmacy.com', ARRAY['CA', 'OR', 'WA']),
  (uuid_generate_v4(), 'Healthcare Pharmacy', '200 Health Ave', 'Medtown', 'NY', '67890', '555-333-4444', 'info@healthcarepharmacy.com', ARRAY['NY', 'NJ', 'CT'])
ON CONFLICT DO NOTHING;

-- Sample tags
INSERT INTO tag (id, name)
VALUES
  (uuid_generate_v4(), 'High Priority'),
  (uuid_generate_v4(), 'Follow-up Required'),
  (uuid_generate_v4(), 'New Patient')
ON CONFLICT (name) DO NOTHING;
