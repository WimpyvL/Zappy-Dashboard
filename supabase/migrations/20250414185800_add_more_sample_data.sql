-- Migration to add more comprehensive sample data

-- Assumes sample client_records, products, services, tags, pharmacies exist from previous migrations.
-- Assumes at least one user exists in auth.users and a corresponding profile in profiles.

-- Sample Data for pb_tasks
INSERT INTO public.pb_tasks (title, notes, due_date, completed, user_id, client_record_id, priority) -- Corrected column name
SELECT 
  'Follow up with ' || cr.first_name, 
  'Discuss lab results from last visit.', 
  NOW() + INTERVAL '3 days', 
  false, 
  (SELECT id FROM auth.users LIMIT 1), -- ASSUMES at least one user exists
  cr.id, 
  'High'
FROM client_record cr LIMIT 1;

INSERT INTO public.pb_tasks (title, notes, completed, user_id, patient_id, priority)
SELECT 
  'Schedule initial consultation for ' || cr.first_name, 
  'Patient interested in weight management program.', 
  false, 
  (SELECT id FROM auth.users LIMIT 1), -- ASSUMES at least one user exists
  cr.id, 
  'Medium'
FROM client_record cr OFFSET 1 LIMIT 1;

-- Sample Data for questionnaire
INSERT INTO public.questionnaire (name, description, structure, status, form_type, slug) VALUES
('Initial Health Assessment', 'Comprehensive intake form for new patients.', '{"pages": [{"title": "Personal Info", "fields": [{"name": "dob", "label": "Date of Birth", "type": "date"}]}]}', true, 'intake', 'initial-health-assessment'),
('Follow-up Survey', 'Quick check-in form for existing patients.', '{"pages": [{"title": "Symptoms", "fields": [{"name": "symptoms", "label": "Current Symptoms", "type": "textarea"}]}]}', true, 'follow-up', 'follow-up-survey')
ON CONFLICT (slug) DO NOTHING; -- Ignore duplicate slugs

-- Sample Data for insurance_records
WITH patient_ids AS (
  SELECT id, row_number() OVER (ORDER BY id) as rn 
  FROM client_record 
  LIMIT 2
)
INSERT INTO public.insurance_records (client_record_id, provider_name, policy_number, group_number, status)
SELECT id, 'Blue Cross Example', 'XYZ123456789', 'GRP987', 'Verified' 
FROM patient_ids 
WHERE rn = 1;

-- Repeat CTE or use separate logic for the second record
WITH patient_ids AS (
  SELECT id, row_number() OVER (ORDER BY id) as rn 
  FROM client_record 
  LIMIT 2
)
INSERT INTO public.insurance_records (client_record_id, provider_name, policy_number, status)
SELECT id, 'Aetna Sample', 'ABC987654321', 'Pending' 
FROM patient_ids 
WHERE rn = 2;

-- Sample Data for insurance_documents (linked to the first insurance_record created above)
INSERT INTO public.insurance_documents (insurance_record_id, file_name, storage_path, url, document_type, uploaded_by)
SELECT 
  ir.id, 
  'insurance_card_front.jpg', 
  'public/insurance/' || ir.id::text || '/insurance_card_front.jpg', -- Example path
  NULL, -- URL might be generated dynamically or signed
  'Insurance Card Front',
  (SELECT id FROM auth.users LIMIT 1) -- ASSUMES at least one user exists
FROM insurance_records ir ORDER BY ir.created_at LIMIT 1
ON CONFLICT (storage_path) DO NOTHING; -- Ignore duplicate storage paths

-- Sample Data for pb_invoices
INSERT INTO public.pb_invoices (client_record_id, status, pb_invoice_metadata, due_date, paid_date) -- Corrected column name
SELECT 
  cr.id, 
  'paid', 
  '{"items": [{"description": "Monthly Subscription", "amount": 99.99}], "total": 99.99}', 
  NOW() - INTERVAL '15 days',
  NOW() - INTERVAL '10 days'
FROM client_record cr LIMIT 1;

INSERT INTO public.pb_invoices (patient_id, status, pb_invoice_metadata, due_date)
SELECT 
  cr.id, 
  'pending', 
  '{"items": [{"description": "Consultation Fee", "amount": 75.00}], "total": 75.00}', 
  NOW() + INTERVAL '10 days'
FROM client_record cr OFFSET 1 LIMIT 1;

-- Sample Data for notes
INSERT INTO public.notes (client_record_id, user_id, note_type, title, content) -- Corrected column name
SELECT 
  cr.id, 
  (SELECT id FROM auth.users LIMIT 1), -- ASSUMES user exists
  'Clinical', 
  'Initial Consult Summary', 
  'Patient presented with concerns about weight management. Discussed options.'
FROM client_record cr LIMIT 1;

INSERT INTO public.notes (patient_id, user_id, note_type, content)
SELECT 
  cr.id, 
  (SELECT id FROM auth.users LIMIT 1), -- ASSUMES user exists
  'Administrative', 
  'Called patient to confirm appointment.'
FROM client_record cr OFFSET 1 LIMIT 1;

-- Sample Data for notifications (Notify user 1 about a task)
INSERT INTO public.notifications (user_id, message, link_url)
SELECT 
  (SELECT id FROM auth.users LIMIT 1), -- ASSUMES user exists
  'New task assigned: Follow up with ' || (SELECT first_name FROM client_record LIMIT 1),
  '/tasks/' || (SELECT id::text FROM pb_tasks ORDER BY created_at DESC LIMIT 1) -- Link to the task created earlier
;

-- Sample Data for orders
-- Order 1: Completed, Product Mix
INSERT INTO public.orders (patient_id, status, total_amount, order_date) 
SELECT 
  cr.id, 
  'completed',
  124.98,
  NOW() - INTERVAL '20 days'
FROM client_record cr LIMIT 1;

-- Order 2: Pending, Single Product, Linked to Pending Invoice
INSERT INTO public.orders (patient_id, status, total_amount, invoice_id, order_date) 
SELECT 
  cr.id, 
  'pending',
  24.99,
  (SELECT id FROM pb_invoices WHERE status = 'pending' LIMIT 1), -- Link to pending invoice
  NOW() - INTERVAL '2 days'
FROM client_record cr OFFSET 1 LIMIT 1;

-- Order 3: Shipped, Single Service
INSERT INTO public.orders (patient_id, status, total_amount, order_date) 
SELECT 
  cr.id, 
  'shipped',
  50.00,
  NOW() - INTERVAL '5 days'
FROM client_record cr LIMIT 1;

-- Order 4: Processing, Product
INSERT INTO public.orders (patient_id, status, total_amount, order_date) 
SELECT 
  cr.id, 
  'processing',
  19.99,
  NOW() - INTERVAL '1 day'
FROM client_record cr OFFSET 1 LIMIT 1;


-- Sample Data for order_items
-- Items for Order 1 (Completed)
INSERT INTO public.order_items (order_id, product_id, quantity, price_at_order)
SELECT 
  o.id, 
  p.id, 
  1, 
  p.price 
FROM orders o, products p WHERE p.name = 'Vitamin D Supplement' AND o.status = 'completed' ORDER BY o.order_date DESC LIMIT 1;

INSERT INTO public.order_items (order_id, product_id, quantity, price_at_order)
SELECT 
  o.id, 
  p.id, 
  1, 
  p.price 
FROM orders o, products p WHERE p.name = 'Blood Pressure Monitor' AND o.status = 'completed' ORDER BY o.order_date DESC LIMIT 1;

-- Item for Order 2 (Pending)
INSERT INTO public.order_items (order_id, product_id, quantity, price_at_order)
SELECT 
  o.id, 
  p.id, 
  1, 
  p.price 
FROM orders o, products p WHERE p.name = 'Vitamin D Supplement' AND o.status = 'pending' ORDER BY o.order_date DESC LIMIT 1;

-- Item for Order 3 (Shipped - Service)
INSERT INTO public.order_items (order_id, service_id, quantity, price_at_order)
SELECT 
  o.id, 
  s.id, 
  1, 
  s.price 
FROM orders o, services s WHERE s.name = 'Medication Review' AND o.status = 'shipped' ORDER BY o.order_date DESC LIMIT 1;

-- Item for Order 4 (Processing)
INSERT INTO public.order_items (order_id, product_id, quantity, price_at_order)
SELECT 
  o.id, 
  p.id, 
  1, 
  p.price 
FROM orders o, products p WHERE p.name = 'Allergy Medication' AND o.status = 'processing' ORDER BY o.order_date DESC LIMIT 1;


-- Sample Data for sessions
INSERT INTO public.sessions (patient_id, provider_id, service_id, start_time, end_time, status, meeting_link) -- Assuming sessions uses patient_id
SELECT 
  cr.id,
  (SELECT id FROM auth.users LIMIT 1), -- ASSUMES provider user exists
  (SELECT id FROM services WHERE name = 'Follow-up Visit'),
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day' + INTERVAL '30 minutes',
  'completed',
  'https://example.zoom.us/j/1234567890'
FROM client_record cr LIMIT 1;

INSERT INTO public.sessions (patient_id, provider_id, service_id, start_time, status)
SELECT 
  cr.id,
  (SELECT id FROM auth.users LIMIT 1), -- ASSUMES provider user exists
  (SELECT id FROM services WHERE name = 'Initial Consultation'),
  NOW() + INTERVAL '2 days',
  'scheduled'
FROM client_record cr OFFSET 1 LIMIT 1;

-- Sample Data for referrals (Assumes profiles exist for users)
-- Assumes user 1 referred user 2 (replace with actual profile IDs if known)
INSERT INTO public.referrals (referrer_user_id, referred_user_id, referral_code_used, status, completed_at, rewarded_at, reward_amount, reward_recipient)
SELECT 
  p1.id, 
  p2.id, 
  p1.referral_code, 
  'rewarded', 
  NOW() - INTERVAL '5 days', 
  NOW() - INTERVAL '4 days',
  (SELECT reward_amount FROM referral_settings WHERE id = 1),
  (SELECT reward_recipient FROM referral_settings WHERE id = 1)
FROM profiles p1, profiles p2 
WHERE p1.id != p2.id -- Ensure referrer and referee are different
ORDER BY p1.created_at, p2.created_at 
LIMIT 1; 

-- Update a profile to be an admin for testing RLS
UPDATE public.profiles SET role = 'admin' WHERE id = (SELECT id FROM auth.users LIMIT 1);
