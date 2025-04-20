# Database Schema Overview

## Core Tables
1. `patients` - Patient/client records (previously client_record)
2. `consultations` - Medical consultations
3. `products` - Products/services offered
4. `services` - Service offerings
5. `subscription_plans` - Subscription packages
6. `pharmacies` - Pharmacy partners
7. `audit_logs` - System activity logs
8. `orders` - Patient orders
9. `discounts` - Discount programs
10. `forms` - Custom forms
11. `form_submissions` - Form responses
12. `insurances` - Insurance providers
13. `insurance_records` - Patient insurance records
14. `insurance_documents` - Insurance document metadata
15. `patient_insurances` - Patient insurance links
16. `invoices` - Billing invoices (pb_invoices)
17. `tags` - Categorization tags
18. `tasks` - System tasks (pb_tasks)
19. `sessions` - Treatment sessions
20. `notes` - Clinical notes
21. `notifications` - System notifications
22. `profiles` - User profiles
23. `referral_settings` - Referral program config
24. `referrals` - Patient referrals
25. `api_logs` - API request logs
26. `form_requests` - Form requests
27. `questionnaire` - Form templates
28. `questionnaire_question` - Form questions (if implemented)
29. `ai_prompts` - AI prompt templates

## Storage Buckets
1. `insurance-documents` - Insurance document files

## Join Tables
1. `patient_tags` - Patient categorization
2. `product_tags` - Product categorization
3. `service_tags` - Service categorization
4. `patient_products` - Patient product history
5. `patient_services` - Patient service history
6. `questionnaire_responses` - Form responses (if implemented)

## System Tables
1. `frontend_errors` - Client-side error tracking
2. `migrations` - Supabase migration history
3. `pg_tables` - Postgres system catalog

## Key Relationships
- Patients ↔ Consultations (One-to-Many)
- Patients ↔ Insurances (Many-to-Many via patient_insurances)
- Patients ↔ Tags (Many-to-Many via patient_tags)
- Products ↔ Tags (Many-to-Many via product_tags)
- Services ↔ Tags (Many-to-Many via service_tags)
