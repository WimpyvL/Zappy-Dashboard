-- Fix database dependencies and data type issues

-- First, ensure the uuid-ossp extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Fix the client_record and consultations tables
DO $$
BEGIN
    -- Check if client_record table exists
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'client_record') THEN
        -- Check if id column is VARCHAR, if so we need to convert it to UUID
        IF EXISTS (SELECT FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'client_record' 
                  AND column_name = 'id' 
                  AND data_type = 'character varying') THEN
            
            -- First, create a temporary column to hold the UUID values
            ALTER TABLE client_record ADD COLUMN temp_id UUID DEFAULT uuid_generate_v4();
            
            -- Update all foreign keys to use the new UUID column
            -- We'll need to handle each dependent table individually
            
            -- For consultations table (if it exists)
            IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'consultations') THEN
                -- Drop the foreign key constraint if it exists
                ALTER TABLE consultations DROP CONSTRAINT IF EXISTS consultations_client_id_fkey;
                
                -- Add a temporary UUID column
                ALTER TABLE consultations ADD COLUMN temp_client_id UUID;
                
                -- Update the temporary column with UUID values that match client_record
                UPDATE consultations c
                SET temp_client_id = cr.temp_id
                FROM client_record cr
                WHERE c.client_id = cr.id;
                
                -- Drop the old column and rename the new one
                ALTER TABLE consultations DROP COLUMN client_id;
                ALTER TABLE consultations RENAME COLUMN temp_client_id TO client_id;
            END IF;
            
            -- Handle other dependent tables similarly
            -- (We'll add code for other tables if needed)
            
            -- Now we can safely modify the client_record table
            -- Drop the old id column and rename the new one
            ALTER TABLE client_record DROP COLUMN id CASCADE;
            ALTER TABLE client_record RENAME COLUMN temp_id TO id;
            ALTER TABLE client_record ADD PRIMARY KEY (id);
        END IF;
        
        -- Check if phone column exists, if not add it
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_schema = 'public' 
                      AND table_name = 'client_record' 
                      AND column_name = 'phone') THEN
            ALTER TABLE client_record ADD COLUMN phone TEXT;
        END IF;
    ELSE
        -- Create client_record table if it doesn't exist
        CREATE TABLE client_record (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          email TEXT UNIQUE,
          phone TEXT,
          date_of_birth DATE,
          address TEXT,
          city TEXT,
          state TEXT,
          zip TEXT,
          insurance_provider TEXT,
          insurance_id TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
    
    -- Recreate or update consultations table
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'consultations') THEN
        -- Create consultations table
        CREATE TABLE consultations (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          client_id UUID,
          consultation_type TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          dateSubmitted TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          dateScheduled TIMESTAMP WITH TIME ZONE,
          dateCompleted TIMESTAMP WITH TIME ZONE,
          provider_notes TEXT,
          client_notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
    
    -- Add foreign key constraint if it doesn't exist
    -- First check if both columns are UUID type
    IF EXISTS (SELECT FROM information_schema.columns 
              WHERE table_schema = 'public' 
              AND table_name = 'client_record' 
              AND column_name = 'id' 
              AND data_type = 'uuid') 
       AND 
       EXISTS (SELECT FROM information_schema.columns 
              WHERE table_schema = 'public' 
              AND table_name = 'consultations' 
              AND column_name = 'client_id' 
              AND data_type = 'uuid') THEN
        
        -- Check if constraint already exists
        IF NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'consultations_client_id_fkey') THEN
            -- Add the foreign key constraint
            ALTER TABLE consultations ADD CONSTRAINT consultations_client_id_fkey 
            FOREIGN KEY (client_id) REFERENCES client_record(id);
        END IF;
    END IF;
END $$;

-- Realtime was enabled in a previous migration
