-- Check products table column names
SELECT column_name 
FROM information_schema.columns
WHERE table_name = 'products'
AND table_schema = 'public';