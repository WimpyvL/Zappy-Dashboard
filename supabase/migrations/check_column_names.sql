-- Check subscription_plans table for billing_cycle column
SELECT column_name 
FROM information_schema.columns
WHERE table_name = 'subscription_plans'
AND table_schema = 'public';

-- Check products table for all column names
SELECT column_name 
FROM information_schema.columns
WHERE table_name = 'products'
AND table_schema = 'public';

-- Check services table for duration column name
SELECT column_name 
FROM information_schema.columns
WHERE table_name = 'services'
AND table_schema = 'public';