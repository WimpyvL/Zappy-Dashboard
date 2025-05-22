-- Enable RLS on tables but add policies to allow access
ALTER TABLE IF EXISTS client_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS services ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS consultations ENABLE ROW LEVEL SECURITY;

-- Add public access policies for client_records
DROP POLICY IF EXISTS "Allow public access to client_records" ON client_records;
CREATE POLICY "Allow public access to client_records"
ON client_records FOR ALL
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
ALTER PUBLICATION supabase_realtime ADD TABLE client_records;
ALTER PUBLICATION supabase_realtime ADD TABLE services;
ALTER PUBLICATION supabase_realtime ADD TABLE tags;
ALTER PUBLICATION supabase_realtime ADD TABLE consultations;
