-- Migration to create the frontend_errors table for logging client-side issues

CREATE TABLE IF NOT EXISTS frontend_errors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Optional: Link to the user if logged in
  error_message TEXT NOT NULL, -- The main error message
  stack_trace TEXT, -- The JavaScript stack trace
  component_context TEXT, -- Optional: Name of the component/area where the error occurred
  additional_details JSONB, -- Optional: Any extra context (e.g., state, props, browser info)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() -- Timestamp of when the error was logged
);

-- Optional: Add comment on the table
COMMENT ON TABLE frontend_errors IS 'Stores errors logged from the frontend application.';

-- Optional: Enable realtime if needed (unlikely for error logs unless building a live dashboard)
-- ALTER PUBLICATION supabase_realtime ADD TABLE frontend_errors;
