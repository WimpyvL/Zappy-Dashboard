-- Fix column names and relationships in tables

-- First, ensure the uuid-ossp extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Fix the patients table
DO $$
BEGIN
    -- Check if patients table exists
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'patients') THEN
        -- Check if date_created column exists, if not add it
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_schema = 'public' 
                      AND table_name = 'patients' 
                      AND column_name = 'date_created') THEN
            ALTER TABLE patients ADD COLUMN date_created TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        END IF;
        
        -- Check if created_at column exists, if not add it as an alias to date_created
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_schema = 'public' 
                      AND table_name = 'patients' 
                      AND column_name = 'created_at') THEN
            -- We'll use date_created instead of created_at in our queries
            -- No need to add created_at column
        END IF;
    END IF;
    
    -- Fix the order table
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'order') THEN
        -- Check if patients_id column exists and is a foreign key
        IF EXISTS (SELECT FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'order' 
                  AND column_name = 'patients_id') THEN
            -- Drop the foreign key constraint if it exists
            -- We'll handle the relationship in the application code instead
            ALTER TABLE "order" DROP CONSTRAINT IF EXISTS fk_order_patients;
        END IF;
    END IF;
    
    -- Fix the session table
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'session') THEN
        -- Check if patients_id column exists and is a foreign key
        IF EXISTS (SELECT FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'session' 
                  AND column_name = 'patients_id') THEN
            -- Drop the foreign key constraint if it exists
            -- We'll handle the relationship in the application code instead
            ALTER TABLE session DROP CONSTRAINT IF EXISTS fk_session_patients;
        END IF;
    END IF;
END $$;

-- Realtime enabling handled elsewhere or in previous migrations
