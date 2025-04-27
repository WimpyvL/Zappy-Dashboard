-- Check the actual columns of the patients table
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'patients'
AND table_schema = 'public'
ORDER BY ordinal_position;