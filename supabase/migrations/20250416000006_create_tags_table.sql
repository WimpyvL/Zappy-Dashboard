-- Create tags table with color field
CREATE TABLE IF NOT EXISTS public.tag (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    color VARCHAR(50) DEFAULT 'gray',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE public.tag ENABLE ROW LEVEL SECURITY;

-- Create policy for public access
DROP POLICY IF EXISTS "Public access" ON public.tag;
CREATE POLICY "Public access"
ON public.tag FOR SELECT
USING (true);

-- Create policy for authenticated users to insert
DROP POLICY IF EXISTS "Auth insert" ON public.tag;
CREATE POLICY "Auth insert"
ON public.tag FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Create policy for authenticated users to update
DROP POLICY IF EXISTS "Auth update" ON public.tag;
CREATE POLICY "Auth update"
ON public.tag FOR UPDATE
USING (auth.role() = 'authenticated');

-- Create policy for authenticated users to delete
DROP POLICY IF EXISTS "Auth delete" ON public.tag;
CREATE POLICY "Auth delete"
ON public.tag FOR DELETE
USING (auth.role() = 'authenticated');

-- Enable realtime
alter publication supabase_realtime add table public.tag;
