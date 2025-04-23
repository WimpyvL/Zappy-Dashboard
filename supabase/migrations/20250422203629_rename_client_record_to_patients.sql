-- Migration to rename patients table to patients
BEGIN;

-- Rename the table if it exists
ALTER TABLE IF EXISTS public.patients RENAME TO patients;

-- Update all foreign key constraints
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    FOR constraint_record IN 
        SELECT conname, conrelid::regclass AS table_name
        FROM pg_constraint
        WHERE confrelid = 'public.patients'::regclass
    LOOP
        EXECUTE format('ALTER TABLE %s RENAME CONSTRAINT %s TO %s', 
            constraint_record.table_name, 
            constraint_record.conname, 
            replace(constraint_record.conname, 'patients', 'patients'));
    END LOOP;
END $$;

COMMIT;
