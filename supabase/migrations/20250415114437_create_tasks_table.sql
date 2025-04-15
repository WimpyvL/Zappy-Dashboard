-- Ensure the updated_at trigger function exists
-- CREATE OR REPLACE FUNCTION trigger_set_timestamp()...

-- Create tasks table
CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done', 'archived')),
  priority text CHECK (priority IN ('low', 'medium', 'high')),
  due_date date,
  assigned_to_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  patient_id uuid REFERENCES patients(id) ON DELETE SET NULL, -- Optional link to a patient
  tags text[] -- Array of text tags
);

-- Add indexes
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to_user_id);
CREATE INDEX idx_tasks_created_by ON tasks(created_by_user_id);
CREATE INDEX idx_tasks_patient_id ON tasks(patient_id);
CREATE INDEX idx_tasks_tags ON tasks USING GIN (tags); -- GIN index for array searching

-- Trigger to automatically update updated_at timestamp
CREATE TRIGGER set_tasks_timestamp
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Enable Row Level Security (RLS)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow users to manage tasks they created or are assigned to
CREATE POLICY "Users can manage their own or assigned tasks" ON tasks
  FOR ALL USING (auth.uid() = created_by_user_id OR auth.uid() = assigned_to_user_id)
  WITH CHECK (auth.uid() = created_by_user_id OR auth.uid() = assigned_to_user_id);

-- Optional: RLS Policy for admins/managers to view all tasks
-- CREATE POLICY "Allow managers to view all tasks" ON tasks FOR SELECT USING (is_manager(auth.uid()));

-- Optional: RLS Policy for service_role or specific admin roles to bypass RLS
-- CREATE POLICY "Allow full access for admins" ON tasks ...

COMMENT ON TABLE tasks IS 'Stores tasks or to-do items.';
COMMENT ON COLUMN tasks.assigned_to_user_id IS 'The user assigned to complete the task.';
COMMENT ON COLUMN tasks.created_by_user_id IS 'The user who created the task.';
COMMENT ON COLUMN tasks.patient_id IS 'Optional link to a patient relevant to the task.';
COMMENT ON COLUMN tasks.tags IS 'Array of tags for categorizing the task.';
