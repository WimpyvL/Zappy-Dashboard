-- First, check if the pb_tasks table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pb_tasks') THEN
        -- Create the table if it doesn't exist
        CREATE TABLE pb_tasks (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title TEXT NOT NULL,
            due_date TIMESTAMP WITH TIME ZONE,
            user_id UUID REFERENCES auth.users(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
    END IF;
END$$;

-- Create task_status enum type if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
        CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
    END IF;
END$$;

-- Add created_by column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pb_tasks' AND column_name = 'created_by') THEN
        ALTER TABLE pb_tasks ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;
END$$;

-- Add or update status column
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pb_tasks' AND column_name = 'status') THEN
        ALTER TABLE pb_tasks ADD COLUMN status task_status DEFAULT 'pending';
    ELSE
        -- Check if the column is already the correct type
        IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'pb_tasks' AND column_name = 'status') != 'USER-DEFINED' THEN
            -- First, create a temporary column
            ALTER TABLE pb_tasks ADD COLUMN status_new task_status DEFAULT 'pending';
            
            -- Update the new column based on the old one if there's a 'completed' column
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pb_tasks' AND column_name = 'completed') THEN
                UPDATE pb_tasks SET status_new = 
                    CASE 
                        WHEN completed = true THEN 'completed'::task_status
                        ELSE 'pending'::task_status
                    END;
            END IF;
            
            -- Drop the old column and rename the new one
            ALTER TABLE pb_tasks DROP COLUMN status;
            ALTER TABLE pb_tasks RENAME COLUMN status_new TO status;
        END IF;
    END IF;
END$$;

-- Set a default value for created_by for existing records
DO $$
DECLARE
    system_user_id UUID;
BEGIN
    -- Try to find a system user
    SELECT id INTO system_user_id FROM auth.users WHERE email LIKE '%system%' LIMIT 1;
    
    -- If no system user found, try to get any user
    IF system_user_id IS NULL THEN
        SELECT id INTO system_user_id FROM auth.users LIMIT 1;
    END IF;
    
    -- Update only if we found a user and there are records with NULL created_by
    IF system_user_id IS NOT NULL THEN
        UPDATE pb_tasks SET created_by = system_user_id WHERE created_by IS NULL;
    END IF;
END$$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON pb_tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON pb_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON pb_tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON pb_tasks(due_date);
