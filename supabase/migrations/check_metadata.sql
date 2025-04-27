-- Check if metadata column exists in services table
SELECT column_name 
FROM information_schema.columns
WHERE table_name = 'services'
AND table_schema = 'public'
AND column_name = 'metadata';