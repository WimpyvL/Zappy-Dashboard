-- Migration to create the api_logs table for audit purposes

CREATE TABLE IF NOT EXISTS public.api_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- User performing the action, if logged in
  method TEXT, -- e.g., GET, POST, PUT, DELETE, or custom action like 'FRONTEND_ACTION'
  path TEXT, -- API endpoint path or description of action
  status_code INTEGER, -- HTTP status code for API calls, or custom status
  request_body JSONB, -- Request payload or details of the action
  response_body JSONB, -- Response payload (if applicable)
  ip_address INET, -- IP address of the client (might be hard to get reliably)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.api_logs IS 'Stores audit logs for API requests and potentially other system events.';
COMMENT ON COLUMN public.api_logs.user_id IS 'The authenticated user associated with the log entry, if available.';
COMMENT ON COLUMN public.api_logs.method IS 'HTTP method or type of action logged.';
COMMENT ON COLUMN public.api_logs.path IS 'API path requested or description of the logged action.';
COMMENT ON COLUMN public.api_logs.status_code IS 'HTTP status code returned or custom status indicator.';
COMMENT ON COLUMN public.api_logs.request_body IS 'Payload of the request or details associated with the action.';
COMMENT ON COLUMN public.api_logs.response_body IS 'Payload of the response, if applicable.';

-- Enable Row Level Security (RLS)
ALTER TABLE public.api_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies:
-- Allow only admins to read/write audit logs
DROP POLICY IF EXISTS "Allow admin full access on api_logs" ON public.api_logs;
CREATE POLICY "Allow admin full access on api_logs" ON public.api_logs FOR ALL
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- Add indexes for potential filtering/ordering
CREATE INDEX IF NOT EXISTS idx_api_logs_user_id ON public.api_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON public.api_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_logs_path ON public.api_logs (path);

-- Enable realtime (Optional - only if you need live updates on the audit log page)
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.api_logs;
