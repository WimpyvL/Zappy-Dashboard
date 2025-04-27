-- Sample Patient Data for Testing
-- Date: April 27, 2025
-- This script creates sample patients, consultations, and sessions for testing

BEGIN;

-- Sample Patients
INSERT INTO patients (
  id,
  first_name,
  last_name,
  email,
  phone,
  date_of_birth,
  address_line1,
  address_line2,
  city,
  state,
  postal_code,
  country,
  gender,
  emergency_contact_name,
  emergency_contact_phone,
  insurance_provider,
  insurance_policy_number,
  medical_conditions,
  allergies,
  medications,
  preferred_pharmacy,
  preferred_communication,
  is_active,
  created_at,
  updated_at
) VALUES
  -- Patient 1
  (
    'a1b2c3d4-e5f6-4a5b-8c9d-1e2f3a4b5c6d',
    'Sarah',
    'Johnson',
    'sarah.johnson@example.com',
    '+1-555-123-4567',
    '1985-04-12',
    '123 Main Street',
    'Apt 4B',
    'Chicago',
    'IL',
    '60601',
    'USA',
    'Female',
    'Michael Johnson',
    '+1-555-987-6543',
    'Blue Cross Blue Shield',
    'BCBS12345678',
    jsonb_build_array('Asthma', 'Seasonal allergies'),
    jsonb_build_array('Penicillin', 'Shellfish'),
    jsonb_build_array('Albuterol inhaler', 'Zyrtec'),
    'Walgreens Downtown',
    'Email',
    true,
    NOW() - INTERVAL '3 months',
    NOW() - INTERVAL '2 weeks'
  ),
  
  -- Patient 2
  (
    'b2c3d4e5-f6a7-5b6c-9d0e-2f3a4b5c6d7e',
    'Robert',
    'Martinez',
    'robert.martinez@example.com',
    '+1-555-234-5678',
    '1972-09-28',
    '456 Oak Avenue',
    NULL,
    'San Francisco',
    'CA',
    '94107',
    'USA',
    'Male',
    'Elena Martinez',
    '+1-555-876-5432',
    'Kaiser Permanente',
    'KP87654321',
    jsonb_build_array('Type 2 diabetes', 'Hypertension'),
    jsonb_build_array('Sulfa drugs'),
    jsonb_build_array('Metformin', 'Lisinopril'),
    'CVS Pharmacy Union Square',
    'Phone',
    true,
    NOW() - INTERVAL '5 months',
    NOW() - INTERVAL '1 month'
  ),
  
  -- Patient 3
  (
    'c3d4e5f6-a7b8-6c7d-0e1f-3a4b5c6d7e8f',
    'Aisha',
    'Patel',
    'aisha.patel@example.com',
    '+1-555-345-6789',
    '1990-11-15',
    '789 Pine Street',
    'Suite 12',
    'New York',
    'NY',
    '10001',
    'USA',
    'Female',
    'Raj Patel',
    '+1-555-765-4321',
    'Aetna',
    'AET98765432',
    jsonb_build_array('Migraine'),
    jsonb_build_array('Ibuprofen'),
    jsonb_build_array('Sumatriptan', 'Propranolol'),
    'Local Care Pharmacy',
    'Email',
    true,
    NOW() - INTERVAL '2 months',
    NOW() - INTERVAL '1 week'
  ),
  
  -- Patient 4
  (
    'd4e5f6a7-b8c9-7d0e-1f2a-4b5c6d7e8f9a',
    'James',
    'Wilson',
    'james.wilson@example.com',
    '+1-555-456-7890',
    '1965-03-22',
    '321 Elm Street',
    NULL,
    'Boston',
    'MA',
    '02108',
    'USA',
    'Male',
    'Margaret Wilson',
    '+1-555-654-3210',
    'United Healthcare',
    'UHC56789012',
    jsonb_build_array('Arthritis', 'High cholesterol'),
    jsonb_build_array('Codeine'),
    jsonb_build_array('Atorvastatin', 'Naproxen'),
    'CVS Pharmacy Back Bay',
    'Phone',
    true,
    NOW() - INTERVAL '7 months',
    NOW() - INTERVAL '3 weeks'
  ),
  
  -- Patient 5
  (
    'e5f6a7b8-c9d0-8e1f-2a3b-5c6d7e8f9a0b',
    'Maria',
    'Garcia',
    'maria.garcia@example.com',
    '+1-555-567-8901',
    '1995-07-18',
    '654 Maple Avenue',
    'Apt 7C',
    'Miami',
    'FL',
    '33101',
    'USA',
    'Female',
    'Carlos Garcia',
    '+1-555-543-2109',
    'Cigna',
    'CIG34567890',
    jsonb_build_array('Anxiety', 'Eczema'),
    jsonb_build_array('Latex'),
    jsonb_build_array('Escitalopram', 'Hydrocortisone cream'),
    'Walgreens South Beach',
    'Email',
    true,
    NOW() - INTERVAL '1 month',
    NOW() - INTERVAL '3 days'
  )
ON CONFLICT (id) DO NOTHING;

-- Sample Providers (needed for consultations)
INSERT INTO providers (
  id,
  first_name,
  last_name,
  email,
  specialty,
  license_number,
  years_of_experience,
  bio,
  is_active
) VALUES
  (
    'f6a7b8c9-d0e1-9f0a-3b4c-6d7e8f9a0b1c',
    'David',
    'Chen',
    'dr.chen@zappyhealth.com',
    'Family Medicine',
    'FM12345678',
    15,
    'Dr. Chen specializes in family medicine with a focus on preventive care and managing chronic conditions.',
    true
  ),
  (
    'a7b8c9d0-e1f2-0a1b-4c5d-7e8f9a0b1c2d',
    'Rebecca',
    'Williams',
    'dr.williams@zappyhealth.com',
    'Psychiatry',
    'PSY87654321',
    12,
    'Dr. Williams is a board-certified psychiatrist specializing in anxiety, depression, and PTSD treatment.',
    true
  ),
  (
    'b8c9d0e1-f2a3-1b2c-5d6e-8f9a0b1c2d3e',
    'Michael',
    'Johnson',
    'dr.johnson@zappyhealth.com',
    'Nutrition',
    'NUT56781234',
    8,
    'Dr. Johnson is a registered dietitian with experience in helping patients manage weight and improve overall nutrition.',
    true
  )
ON CONFLICT (id) DO NOTHING;

-- Sample Services (needed for consultations)
INSERT INTO services (
  id,
  name,
  description,
  price,
  duration_minutes,
  category,
  is_active,
  requires_consultation
) VALUES
  (
    '67890123-7890-7890-7890-678901234567',
    'Initial Health Assessment',
    'Comprehensive initial health evaluation for new patients',
    150.00,
    60,
    'General',
    true,
    true
  ),
  (
    '78901234-8901-8901-8901-789012345678',
    'Mental Health Consultation',
    'Evaluation and treatment planning for mental health concerns',
    175.00,
    50,
    'Mental Health',
    true,
    true
  ),
  (
    '89012345-9012-9012-9012-890123456789',
    'Nutrition Planning Session',
    'Personalized nutrition assessment and meal planning',
    125.00,
    45,
    'Nutrition',
    true,
    false
  )
ON CONFLICT (id) DO NOTHING;

-- Sample Consultations
INSERT INTO consultations (
  id,
  patient_id,
  provider_id,
  service_id,
  status,
  scheduled_date,
  actual_start_time,
  actual_end_time,
  consultation_notes,
  follow_up_required,
  follow_up_date,
  created_at,
  updated_at
) VALUES
  -- Sarah's initial consultation
  (
    'abcdef12-3456-7890-abcd-ef1234567890',
    'a1b2c3d4-e5f6-4a5b-8c9d-1e2f3a4b5c6d', -- Sarah Johnson
    'f6a7b8c9-d0e1-9f0a-3b4c-6d7e8f9a0b1c', -- Dr. Chen
    '67890123-7890-7890-7890-678901234567', -- Initial Health Assessment
    'Completed',
    NOW() - INTERVAL '2 months 15 days',
    NOW() - INTERVAL '2 months 15 days' + INTERVAL '10 minutes',
    NOW() - INTERVAL '2 months 15 days' + INTERVAL '70 minutes',
    'Patient presents with concerns about recent asthma flare-ups. Physical examination normal except for slight wheezing. Recommended daily preventative inhaler and rescue inhaler as needed.',
    true,
    NOW() - INTERVAL '1 month 15 days',
    NOW() - INTERVAL '2 months 20 days',
    NOW() - INTERVAL '2 months 15 days'
  ),
  
  -- Sarah's follow-up
  (
    'bcdef123-4567-8901-bcde-f12345678901',
    'a1b2c3d4-e5f6-4a5b-8c9d-1e2f3a4b5c6d', -- Sarah Johnson
    'f6a7b8c9-d0e1-9f0a-3b4c-6d7e8f9a0b1c', -- Dr. Chen
    '67890123-7890-7890-7890-678901234567', -- Initial Health Assessment (reusing for follow-up)
    'Completed',
    NOW() - INTERVAL '1 month 15 days',
    NOW() - INTERVAL '1 month 15 days' + INTERVAL '5 minutes',
    NOW() - INTERVAL '1 month 15 days' + INTERVAL '35 minutes',
    'Follow-up for asthma management. Patient reports improvement with current medication regimen. Continuing current plan with seasonal allergy management added.',
    true,
    NOW() + INTERVAL '2 weeks',
    NOW() - INTERVAL '1 month 20 days',
    NOW() - INTERVAL '1 month 15 days'
  ),
  
  -- Robert's consultation
  (
    'cdef1234-5678-9012-cdef-123456789012',
    'b2c3d4e5-f6a7-5b6c-9d0e-2f3a4b5c6d7e', -- Robert Martinez
    'f6a7b8c9-d0e1-9f0a-3b4c-6d7e8f9a0b1c', -- Dr. Chen
    '67890123-7890-7890-7890-678901234567', -- Initial Health Assessment
    'Completed',
    NOW() - INTERVAL '4 months',
    NOW() - INTERVAL '4 months' + INTERVAL '8 minutes',
    NOW() - INTERVAL '4 months' + INTERVAL '72 minutes',
    'Patient seeking better management of Type 2 diabetes and hypertension. Current medications reviewed and adjustments made to improve blood sugar control. Dietary recommendations provided.',
    true,
    NOW() - INTERVAL '3 months',
    NOW() - INTERVAL '4 months 5 days',
    NOW() - INTERVAL '4 months'
  ),
  
  -- Aisha's mental health consultation
  (
    'def12345-6789-0123-def1-2345678901234',
    'c3d4e5f6-a7b8-6c7d-0e1f-3a4b5c6d7e8f', -- Aisha Patel
    'a7b8c9d0-e1f2-0a1b-4c5d-7e8f9a0b1c2d', -- Dr. Williams
    '78901234-8901-8901-8901-789012345678', -- Mental Health Consultation
    'Completed',
    NOW() - INTERVAL '6 weeks',
    NOW() - INTERVAL '6 weeks' + INTERVAL '2 minutes',
    NOW() - INTERVAL '6 weeks' + INTERVAL '52 minutes',
    'Patient presents with recurrent migraine headaches that are affecting quality of life and work performance. Discussing potential triggers and treatment options including prophylactic medication.',
    true,
    NOW() - INTERVAL '3 weeks',
    NOW() - INTERVAL '7 weeks',
    NOW() - INTERVAL '6 weeks'
  ),
  
  -- James's consultation
  (
    'ef123456-7890-1234-ef12-34567890123',
    'd4e5f6a7-b8c9-7d0e-1f2a-4b5c6d7e8f9a', -- James Wilson
    'f6a7b8c9-d0e1-9f0a-3b4c-6d7e8f9a0b1c', -- Dr. Chen
    '67890123-7890-7890-7890-678901234567', -- Initial Health Assessment
    'Completed',
    NOW() - INTERVAL '6 months',
    NOW() - INTERVAL '6 months' + INTERVAL '12 minutes',
    NOW() - INTERVAL '6 months' + INTERVAL '68 minutes',
    'Patient with arthritis seeking pain management options and preventive care for cardiovascular health due to high cholesterol. Discussed medication options and lifestyle modifications.',
    true,
    NOW() - INTERVAL '3 months',
    NOW() - INTERVAL '6 months 10 days',
    NOW() - INTERVAL '6 months'
  ),
  
  -- Maria's nutrition consultation
  (
    'f1234567-8901-2345-f123-4567890123',
    'e5f6a7b8-c9d0-8e1f-2a3b-5c6d7e8f9a0b', -- Maria Garcia
    'b8c9d0e1-f2a3-1b2c-5d6e-8f9a0b1c2d3e', -- Dr. Johnson
    '89012345-9012-9012-9012-890123456789', -- Nutrition Planning Session
    'Scheduled',
    NOW() + INTERVAL '1 week',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NOW() - INTERVAL '2 weeks',
    NOW() - INTERVAL '2 weeks'
  ),
  
  -- Sarah's upcoming appointment
  (
    'a1234567-8901-2345-a123-4567890123',
    'a1b2c3d4-e5f6-4a5b-8c9d-1e2f3a4b5c6d', -- Sarah Johnson
    'f6a7b8c9-d0e1-9f0a-3b4c-6d7e8f9a0b1c', -- Dr. Chen
    '67890123-7890-7890-7890-678901234567', -- Initial Health Assessment (reusing for follow-up)
    'Scheduled',
    NOW() + INTERVAL '2 weeks',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NOW() - INTERVAL '1 week',
    NOW() - INTERVAL '1 week'
  )
ON CONFLICT (id) DO NOTHING;

-- Sample Sessions
INSERT INTO sessions (
  id,
  patient_id,
  provider_id,
  consultation_id,
  session_type,
  start_time,
  end_time,
  duration_minutes,
  status,
  notes,
  activities_completed,
  next_steps,
  resources_provided,
  created_at,
  updated_at
) VALUES
  -- Sarah's first session
  (
    'aaaaabbb-cccc-dddd-eeee-ffffffffffff',
    'a1b2c3d4-e5f6-4a5b-8c9d-1e2f3a4b5c6d', -- Sarah Johnson
    'f6a7b8c9-d0e1-9f0a-3b4c-6d7e8f9a0b1c', -- Dr. Chen
    'abcdef12-3456-7890-abcd-ef1234567890', -- Related consultation
    'Initial Assessment',
    NOW() - INTERVAL '2 months 15 days' + INTERVAL '10 minutes',
    NOW() - INTERVAL '2 months 15 days' + INTERVAL '70 minutes',
    60,
    'Completed',
    'Conducted comprehensive health assessment. Patient has well-controlled asthma with occasional flare-ups during allergy season.',
    jsonb_build_array('Medical history review', 'Physical examination', 'Medication review', 'Treatment plan discussion'),
    'Follow up in 1 month to assess effectiveness of asthma management plan.',
    jsonb_build_array('Asthma action plan', 'Allergen avoidance guide'),
    NOW() - INTERVAL '2 months 15 days',
    NOW() - INTERVAL '2 months 15 days'
  ),
  
  -- Sarah's follow-up session
  (
    'bbbbcccc-dddd-eeee-ffff-gggggggggggg',
    'a1b2c3d4-e5f6-4a5b-8c9d-1e2f3a4b5c6d', -- Sarah Johnson
    'f6a7b8c9-d0e1-9f0a-3b4c-6d7e8f9a0b1c', -- Dr. Chen
    'bcdef123-4567-8901-bcde-f12345678901', -- Related consultation
    'Follow-up',
    NOW() - INTERVAL '1 month 15 days' + INTERVAL '5 minutes',
    NOW() - INTERVAL '1 month 15 days' + INTERVAL '35 minutes',
    30,
    'Completed',
    'Patient reports improved asthma control with current regimen. No nighttime symptoms. Peak flow measurements are stable.',
    jsonb_build_array('Medication compliance review', 'Symptom assessment', 'Peak flow measurement'),
    'Continue current medication regimen. Next follow-up in 3 months unless symptoms worsen.',
    jsonb_build_array('Updated asthma action plan'),
    NOW() - INTERVAL '1 month 15 days',
    NOW() - INTERVAL '1 month 15 days'
  ),
  
  -- Robert's session
  (
    'ccccdddd-eeee-ffff-gggg-hhhhhhhhhhhh',
    'b2c3d4e5-f6a7-5b6c-9d0e-2f3a4b5c6d7e', -- Robert Martinez
    'f6a7b8c9-d0e1-9f0a-3b4c-6d7e8f9a0b1c', -- Dr. Chen
    'cdef1234-5678-9012-cdef-123456789012', -- Related consultation
    'Initial Assessment',
    NOW() - INTERVAL '4 months' + INTERVAL '8 minutes',
    NOW() - INTERVAL '4 months' + INTERVAL '72 minutes',
    64,
    'Completed',
    'Comprehensive review of diabetes and hypertension management. Blood pressure elevated at 142/88. Fasting glucose readings reviewed.',
    jsonb_build_array('Blood pressure check', 'Medication review', 'Glucose log review', 'Dietary assessment'),
    'Adjust metformin dosage. Add daily blood pressure log. Follow up in 1 month.',
    jsonb_build_array('Diabetes management guide', 'Low-sodium diet plan', 'Blood pressure tracking sheet'),
    NOW() - INTERVAL '4 months',
    NOW() - INTERVAL '4 months'
  ),
  
  -- Aisha's session
  (
    'ddddeeeee-ffff-gggg-hhhh-iiiiiiiiiiii',
    'c3d4e5f6-a7b8-6c7d-0e1f-3a4b5c6d7e8f', -- Aisha Patel
    'a7b8c9d0-e1f2-0a1b-4c5d-7e8f9a0b1c2d', -- Dr. Williams
    'def12345-6789-0123-def1-2345678901234', -- Related consultation
    'Psychiatric Evaluation',
    NOW() - INTERVAL '6 weeks' + INTERVAL '2 minutes',
    NOW() - INTERVAL '6 weeks' + INTERVAL '52 minutes',
    50,
    'Completed',
    'Patient reports 3-4 migraine episodes per month, lasting 24-48 hours each. Discussed potential triggers including stress, certain foods, and sleep disruption.',
    jsonb_build_array('Mental health assessment', 'Headache history review', 'Stress management discussion'),
    'Trial of sumatriptan for acute episodes and propranolol as preventative. Headache diary to identify triggers.',
    jsonb_build_array('Migraine trigger tracking template', 'Stress reduction techniques handout'),
    NOW() - INTERVAL '6 weeks',
    NOW() - INTERVAL '6 weeks'
  ),
  
  -- James's session
  (
    'eeeefffff-gggg-hhhh-iiii-jjjjjjjjjjjj',
    'd4e5f6a7-b8c9-7d0e-1f2a-4b5c6d7e8f9a', -- James Wilson
    'f6a7b8c9-d0e1-9f0a-3b4c-6d7e8f9a0b1c', -- Dr. Chen
    'ef123456-7890-1234-ef12-34567890123', -- Related consultation
    'Initial Assessment',
    NOW() - INTERVAL '6 months' + INTERVAL '12 minutes',
    NOW() - INTERVAL '6 months' + INTERVAL '68 minutes',
    56,
    'Completed',
    'Joint assessment shows moderate arthritis in both knees and hands. Cholesterol panel reviewed: LDL elevated at 155.',
    jsonb_build_array('Joint examination', 'Cardiovascular assessment', 'Lab results review'),
    'Increase atorvastatin dosage. Consider physical therapy referral for joint pain management.',
    jsonb_build_array('Arthritis home exercise program', 'Heart-healthy diet guide'),
    NOW() - INTERVAL '6 months',
    NOW() - INTERVAL '6 months'
  )
ON CONFLICT (id) DO NOTHING;

-- Add a comment to notify successful execution
DO $$
BEGIN
    RAISE NOTICE 'Sample patient data has been loaded successfully.';
END $$;

COMMIT;