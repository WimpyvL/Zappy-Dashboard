-- Create pb_tasks table and establish relationships

-- First, ensure the uuid-ossp extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create pb_tasks table if it doesn't exist
CREATE TABLE IF NOT EXISTS pb_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  notes TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN DEFAULT false,
  user_id UUID,
  client_record_id UUID,
  priority TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drop existing foreign key constraints if they exist
ALTER TABLE pb_tasks DROP CONSTRAINT IF EXISTS pb_tasks_user_id_fkey;
ALTER TABLE pb_tasks DROP CONSTRAINT IF EXISTS pb_tasks_client_record_id_fkey;

-- Add foreign key constraints
-- Reference the auth.users table for user IDs
ALTER TABLE pb_tasks ADD CONSTRAINT pb_tasks_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE pb_tasks ADD CONSTRAINT pb_tasks_client_record_id_fkey 
  FOREIGN KEY (client_record_id) REFERENCES client_record(id) ON DELETE SET NULL;

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE pb_tasks;
