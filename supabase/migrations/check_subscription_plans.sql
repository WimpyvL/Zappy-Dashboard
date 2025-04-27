-- Check subscription_plans table column names
SELECT column_name 
FROM information_schema.columns
WHERE table_name = 'subscription_plans'
AND table_schema = 'public';