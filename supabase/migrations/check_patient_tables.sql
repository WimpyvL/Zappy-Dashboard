-- Check patients table structure
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'patients'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check consultations table structure
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'consultations'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check sessions table structure
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'sessions'
AND table_schema = 'public'
ORDER BY ordinal_position;