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
  address,
  city,
  state,
  zip,
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
    '123 Main Street, Apt 4B',
    'Chicago',
    'IL',
    '60601',
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
    'San Francisco',
    'CA',
    '94107',
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
    '789 Pine Street, Suite 12',
    'New York',
    'NY',
    '10001',
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
    'Boston',
    'MA',
    '02108',
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
    '654 Maple Avenue, Apt 7C',
    'Miami',
    'FL',
    '33101',
    NOW() - INTERVAL '1 month',
    NOW() - INTERVAL '3 days'
  )
ON CONFLICT (id) DO NOTHING;

-- Sample Providers (needed for consultations)
INSERT INTO providers (
  id,
  name,
  email,
  specialty,
  active
) VALUES
  (
    'f6a7b8c9-d0e1-9f0a-3b4c-6d7e8f9a0b1c',
    'Dr. David Chen',
    'dr.chen@zappyhealth.com',
    'Family Medicine',
    true
  ),
  (
    'a7b8c9d0-e1f2-0a1b-4c5d-7e8f9a0b1c2d',
    'Dr. Rebecca Williams',
    'dr.williams@zappyhealth.com',
    'Psychiatry',
    true
  ),
  (
    'b8c9d0e1-f2a3-1b2c-5d6e-8f9a0b1c2d3e',
    'Dr. Michael Johnson',
    'dr.johnson@zappyhealth.com',
    'Nutrition',
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
  consultation_type,
  status,
  submitted_at,
  scheduled_at,
  provider_notes,
  client_notes,
  created_at,
  updated_at
) VALUES
  -- Sarah's initial consultation
  (
    'abcdef12-3456-7890-abcd-ef1234567890',
    'a1b2c3d4-e5f6-4a5b-8c9d-1e2f3a4b5c6d', -- Sarah Johnson
    'Initial Health Assessment',
    'completed',
    NOW() - INTERVAL '2 months 15 days',
    NOW() - INTERVAL '2 months 15 days',
    'Patient presents with concerns about recent asthma flare-ups. Physical examination normal except for slight wheezing. Recommended daily preventative inhaler and rescue inhaler as needed.',
    'I have been experiencing more frequent asthma attacks, especially in the morning.',
    NOW() - INTERVAL '2 months 20 days',
    NOW() - INTERVAL '2 months 15 days'
  ),
  
  -- Sarah's follow-up
  (
    'bcdef123-4567-8901-bcde-f12345678901',
    'a1b2c3d4-e5f6-4a5b-8c9d-1e2f3a4b5c6d', -- Sarah Johnson
    'Follow-up Visit',
    'completed',
    NOW() - INTERVAL '1 month 20 days',
    NOW() - INTERVAL '1 month 15 days',
    'Follow-up for asthma management. Patient reports improvement with current medication regimen. Continuing current plan with seasonal allergy management added.',
    'The new inhaler seems to be working well. I have fewer symptoms now.',
    NOW() - INTERVAL '1 month 20 days',
    NOW() - INTERVAL '1 month 15 days'
  ),
  
  -- Robert's consultation
  (
    'cdef1234-5678-9012-cdef-123456789012',
    'b2c3d4e5-f6a7-5b6c-9d0e-2f3a4b5c6d7e', -- Robert Martinez
    'Initial Health Assessment',
    'completed',
    NOW() - INTERVAL '4 months 5 days',
    NOW() - INTERVAL '4 months',
    'Patient seeking better management of Type 2 diabetes and hypertension. Current medications reviewed and adjustments made to improve blood sugar control. Dietary recommendations provided.',
    'My blood sugar readings have been higher than usual in the past month.',
    NOW() - INTERVAL '4 months 5 days',
    NOW() - INTERVAL '4 months'
  ),
  
  -- Aisha's mental health consultation
  (
    'def12345-6789-0123-def1-2345678901234',
    'c3d4e5f6-a7b8-6c7d-0e1f-3a4b5c6d7e8f', -- Aisha Patel
    'Mental Health Consultation',
    'completed',
    NOW() - INTERVAL '7 weeks',
    NOW() - INTERVAL '6 weeks',
    'Patient presents with recurrent migraine headaches that are affecting quality of life and work performance. Discussing potential triggers and treatment options including prophylactic medication.',
    'I have been experiencing more frequent and intense migraines over the past few months.',
    NOW() - INTERVAL '7 weeks',
    NOW() - INTERVAL '6 weeks'
  ),
  
  -- James's consultation
  (
    'ef123456-7890-1234-ef12-34567890123',
    'd4e5f6a7-b8c9-7d0e-1f2a-4b5c6d7e8f9a', -- James Wilson
    'Initial Health Assessment',
    'completed',
    NOW() - INTERVAL '6 months 10 days',
    NOW() - INTERVAL '6 months',
    'Patient with arthritis seeking pain management options and preventive care for cardiovascular health due to high cholesterol. Discussed medication options and lifestyle modifications.',
    'Joint pain has been getting worse, especially in cold weather. Also concerned about my cholesterol levels.',
    NOW() - INTERVAL '6 months 10 days',
    NOW() - INTERVAL '6 months'
  ),
  
  -- Maria's nutrition consultation
  (
    'f1234567-8901-2345-f123-4567890123',
    'e5f6a7b8-c9d0-8e1f-2a3b-5c6d7e8f9a0b', -- Maria Garcia
    'Nutrition Planning',
    'scheduled',
    NOW() - INTERVAL '2 weeks',
    NOW() + INTERVAL '1 week',
    NULL,
    'I would like guidance on improving my diet for better energy levels throughout the day.',
    NOW() - INTERVAL '2 weeks',
    NOW() - INTERVAL '2 weeks'
  ),
  
  -- Sarah's upcoming appointment
  (
    'a1234567-8901-2345-a123-4567890123',
    'a1b2c3d4-e5f6-4a5b-8c9d-1e2f3a4b5c6d', -- Sarah Johnson
    'Follow-up Visit',
    'scheduled',
    NOW() - INTERVAL '1 week',
    NOW() + INTERVAL '2 weeks',
    NULL,
    'Regular check-in for asthma management and medication review.',
    NOW() - INTERVAL '1 week',
    NOW() - INTERVAL '1 week'
  )
ON CONFLICT (id) DO NOTHING;

-- Sample Sessions (if your database has this table)
-- Check if sessions table exists first to avoid errors
DO $$
DECLARE
  table_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'sessions'
  ) INTO table_exists;
  
  IF table_exists THEN
    EXECUTE '
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
      created_at,
      updated_at
    ) VALUES
      -- Sarah''s first session
      (
        ''aaaaabbb-cccc-dddd-eeee-ffffffffffff'',
        ''a1b2c3d4-e5f6-4a5b-8c9d-1e2f3a4b5c6d'', -- Sarah Johnson
        ''f6a7b8c9-d0e1-9f0a-3b4c-6d7e8f9a0b1c'', -- Dr. Chen
        ''abcdef12-3456-7890-abcd-ef1234567890'', -- Related consultation
        ''Initial Assessment'',
        NOW() - INTERVAL ''2 months 15 days'' + INTERVAL ''10 minutes'',
        NOW() - INTERVAL ''2 months 15 days'' + INTERVAL ''70 minutes'',
        60,
        ''Completed'',
        ''Conducted comprehensive health assessment. Patient has well-controlled asthma with occasional flare-ups during allergy season.'',
        NOW() - INTERVAL ''2 months 15 days'',
        NOW() - INTERVAL ''2 months 15 days''
      ),
      
      -- Sarah''s follow-up session
      (
        ''bbbbcccc-dddd-eeee-ffff-gggggggggggg'',
        ''a1b2c3d4-e5f6-4a5b-8c9d-1e2f3a4b5c6d'', -- Sarah Johnson
        ''f6a7b8c9-d0e1-9f0a-3b4c-6d7e8f9a0b1c'', -- Dr. Chen
        ''bcdef123-4567-8901-bcde-f12345678901'', -- Related consultation
        ''Follow-up'',
        NOW() - INTERVAL ''1 month 15 days'' + INTERVAL ''5 minutes'',
        NOW() - INTERVAL ''1 month 15 days'' + INTERVAL ''35 minutes'',
        30,
        ''Completed'',
        ''Patient reports improved asthma control with current regimen. No nighttime symptoms. Peak flow measurements are stable.'',
        NOW() - INTERVAL ''1 month 15 days'',
        NOW() - INTERVAL ''1 month 15 days''
      ),
      
      -- Robert''s session
      (
        ''ccccdddd-eeee-ffff-gggg-hhhhhhhhhhhh'',
        ''b2c3d4e5-f6a7-5b6c-9d0e-2f3a4b5c6d7e'', -- Robert Martinez
        ''f6a7b8c9-d0e1-9f0a-3b4c-6d7e8f9a0b1c'', -- Dr. Chen
        ''cdef1234-5678-9012-cdef-123456789012'', -- Related consultation
        ''Initial Assessment'',
        NOW() - INTERVAL ''4 months'' + INTERVAL ''8 minutes'',
        NOW() - INTERVAL ''4 months'' + INTERVAL ''72 minutes'',
        64,
        ''Completed'',
        ''Comprehensive review of diabetes and hypertension management. Blood pressure elevated at 142/88. Fasting glucose readings reviewed.'',
        NOW() - INTERVAL ''4 months'',
        NOW() - INTERVAL ''4 months''
      )
    ON CONFLICT (id) DO NOTHING';
  END IF;
END $$;

-- Add a comment to notify successful execution
DO $$
BEGIN
    RAISE NOTICE 'Sample patient data has been loaded successfully.';
END $$;

COMMIT;