-- Create tags table
CREATE TABLE tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  -- updated_at is omitted as tags are often immutable once created, add if needed
  name text UNIQUE NOT NULL,
  description text,
  color text -- e.g., hex code '#RRGGBB' or color name 'blue'
);

-- Add indexes
CREATE INDEX idx_tags_name ON tags(name);

-- Enable Row Level Security (RLS)
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow admins (or specific roles) to manage tags
-- Replace 'admin_role_check()' with your actual role checking mechanism
CREATE POLICY "Allow admin management of tags" ON tags
  FOR ALL USING (auth.role() = 'service_role' /* OR admin_role_check() */)
  WITH CHECK (auth.role() = 'service_role' /* OR admin_role_check() */);

-- RLS Policy: Allow authenticated users to view all tags
CREATE POLICY "Allow users to view tags" ON tags
  FOR SELECT USING (auth.role() = 'authenticated');

COMMENT ON TABLE tags IS 'Stores tags used for categorizing various items (e.g., patients, products, tasks).';
COMMENT ON COLUMN tags.name IS 'The unique name/label of the tag.';
COMMENT ON COLUMN tags.color IS 'Optional color associated with the tag for UI display.';
