-- Create audit_logs table
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- User who performed the action, NULL if system action
  action text NOT NULL, -- Description of the action (e.g., 'Patient Created', 'Order Updated')
  table_name text,      -- Optional: Name of the primary table affected (e.g., 'patients', 'orders')
  record_id uuid,       -- Optional: ID of the specific record affected in table_name
  details jsonb         -- Additional context/details about the event
);

-- Add indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Restrict access primarily to admin roles or service_role
-- This is a placeholder; adjust based on your actual role management (e.g., using custom claims)
CREATE POLICY "Allow admin access to audit logs" ON audit_logs
  FOR SELECT USING (
    -- Example: Check for a custom 'admin' role claim
    -- auth.jwt()->>'user_role' = 'admin'
    -- Or allow service_role key access
    auth.role() = 'service_role'
  );

-- Prevent non-admins from inserting/updating/deleting logs directly (should be handled by application logic/triggers)
CREATE POLICY "Disallow direct modification by non-admins" ON audit_logs
  FOR ALL USING (false); -- Effectively blocks direct modification unless bypassed by service_role

COMMENT ON TABLE audit_logs IS 'Stores records of significant actions performed within the application.';
COMMENT ON COLUMN audit_logs.user_id IS 'The user who initiated the logged action.';
COMMENT ON COLUMN audit_logs.action IS 'A description of the action performed.';
COMMENT ON COLUMN audit_logs.details IS 'JSON object containing relevant details about the logged event.';
