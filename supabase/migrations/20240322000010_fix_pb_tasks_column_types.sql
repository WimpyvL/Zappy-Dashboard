-- Fix column types in pb_tasks table to ensure compatibility with foreign keys

-- First, ensure the uuid-ossp extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing foreign key constraints if they exist
ALTER TABLE pb_tasks DROP CONSTRAINT IF EXISTS pb_tasks_user_id_fkey;
ALTER TABLE pb_tasks DROP CONSTRAINT IF EXISTS pb_tasks_patients_id_fkey;

-- Check if pb_tasks table exists
DO $$
BEGIN
    -- Check if patients_id column exists and is of type character varying
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pb_tasks' 
        AND column_name = 'patients_id'
        AND data_type = 'character varying'
    ) THEN
        -- Alter the column type to UUID
        ALTER TABLE pb_tasks ALTER COLUMN patients_id TYPE UUID USING patients_id::UUID;
    END IF;
    
    -- Check if user_id column exists and is of type character varying
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pb_tasks' 
        AND column_name = 'user_id'
        AND data_type = 'character varying'
    ) THEN
        -- Alter the column type to UUID
        ALTER TABLE pb_tasks ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
    END IF;
END $$;

-- Add foreign key constraints with proper error handling
DO $$
BEGIN
    -- Check if the auth.users table exists before adding the constraint
    IF EXISTS (
        SELECT FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'users'
    ) THEN
        BEGIN
            ALTER TABLE pb_tasks ADD CONSTRAINT pb_tasks_user_id_fkey 
            FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not add foreign key constraint to auth.users table: %', SQLERRM;
        END;
    END IF;
    
    -- Check if the patients table exists before adding the constraint
    IF EXISTS (
        SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'patients'
    ) THEN
        BEGIN
            ALTER TABLE pb_tasks ADD CONSTRAINT pb_tasks_patients_id_fkey 
            FOREIGN KEY (patients_id) REFERENCES patients(id) ON DELETE SET NULL;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not add foreign key constraint to patients table: %', SQLERRM;
        END;
    END IF;
END $$;

-- Realtime was enabled in the previous migration
