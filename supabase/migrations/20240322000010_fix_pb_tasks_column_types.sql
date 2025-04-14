-- Fix column types in pb_tasks table to ensure compatibility with foreign keys

-- First, ensure the uuid-ossp extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing foreign key constraints if they exist
ALTER TABLE pb_tasks DROP CONSTRAINT IF EXISTS pb_tasks_user_id_fkey;
ALTER TABLE pb_tasks DROP CONSTRAINT IF EXISTS pb_tasks_client_record_id_fkey;

-- Check if pb_tasks table exists
DO $$
BEGIN
    -- Check if client_record_id column exists and is of type character varying
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pb_tasks' 
        AND column_name = 'client_record_id'
        AND data_type = 'character varying'
    ) THEN
        -- Alter the column type to UUID
        ALTER TABLE pb_tasks ALTER COLUMN client_record_id TYPE UUID USING client_record_id::UUID;
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
    
    -- Check if the client_record table exists before adding the constraint
    IF EXISTS (
        SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'client_record'
    ) THEN
        BEGIN
            ALTER TABLE pb_tasks ADD CONSTRAINT pb_tasks_client_record_id_fkey 
            FOREIGN KEY (client_record_id) REFERENCES client_record(id) ON DELETE SET NULL;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not add foreign key constraint to client_record table: %', SQLERRM;
        END;
    END IF;
END $$;

-- Realtime was enabled in the previous migration
