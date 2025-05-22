-- Enable RLS on tables but add policies to allow access
ALTER TABLE client_record ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

-- Add public access policies for client_record
DROP POLICY IF EXISTS "Allow public access to client_record" ON client_record;
CREATE POLICY "Allow public access to client_record"
ON client_record FOR ALL
USING (true);

-- Add public access policies for services
DROP POLICY IF EXISTS "Allow public access to services" ON services;
CREATE POLICY "Allow public access to services"
ON services FOR ALL
USING (true);

-- Add public access policies for tags
DROP POLICY IF EXISTS "Allow public access to tags" ON tags;
CREATE POLICY "Allow public access to tags"
ON tags FOR ALL
USING (true);

-- Add public access policies for consultations
DROP POLICY IF EXISTS "Allow public access to consultations" ON consultations;
CREATE POLICY "Allow public access to consultations"
ON consultations FOR ALL
USING (true);

-- Enable realtime for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE client_record;
ALTER PUBLICATION supabase_realtime ADD TABLE services;
ALTER PUBLICATION supabase_realtime ADD TABLE tags;
ALTER PUBLICATION supabase_realtime ADD TABLE consultations;