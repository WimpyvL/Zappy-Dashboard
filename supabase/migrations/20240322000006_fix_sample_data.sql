-- This migration ensures sample data is inserted correctly

-- Insert sample client records only if they don't exist
INSERT INTO client_record (id, first_name, last_name, email, phone, date_of_birth, address, city, state, zip)
SELECT 
  uuid_generate_v4(), 'John', 'Doe', 'john.doe@example.com', '555-123-4567', '1980-01-15'::DATE, '123 Main St', 'Anytown', 'CA', '90210'
WHERE NOT EXISTS (SELECT 1 FROM client_record WHERE email = 'john.doe@example.com');

INSERT INTO client_record (id, first_name, last_name, email, phone, date_of_birth, address, city, state, zip)
SELECT 
  uuid_generate_v4(), 'Jane', 'Smith', 'jane.smith@example.com', '555-987-6543', '1992-05-22'::DATE, '456 Oak Ave', 'Somewhere', 'NY', '10001'
WHERE NOT EXISTS (SELECT 1 FROM client_record WHERE email = 'jane.smith@example.com');

INSERT INTO client_record (id, first_name, last_name, email, phone, date_of_birth, address, city, state, zip)
SELECT 
  uuid_generate_v4(), 'Michael', 'Johnson', 'michael.j@example.com', '555-555-5555', '1975-11-30'::DATE, '789 Pine Rd', 'Elsewhere', 'TX', '75001'
WHERE NOT EXISTS (SELECT 1 FROM client_record WHERE email = 'michael.j@example.com');

-- Insert sample consultations safely
INSERT INTO consultations (client_id, consultation_type, status, dateScheduled)
SELECT 
  id, 
  'Initial Consultation', 
  'pending', 
  NOW() + (RANDOM() * INTERVAL '10 days')
FROM client_record
WHERE NOT EXISTS (
  SELECT 1 FROM consultations c 
  WHERE c.client_id = client_record.id AND c.consultation_type = 'Initial Consultation'
)
LIMIT 3;