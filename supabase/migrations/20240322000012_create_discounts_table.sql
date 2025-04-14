-- Create discounts table
CREATE TABLE IF NOT EXISTS discounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL, -- Assumed unique based on hook error handling
  description TEXT,
  status BOOLEAN DEFAULT true, -- Assumed boolean based on hook mapping
  amount DECIMAL(10, 2), -- For fixed amount discounts
  percentage INTEGER, -- For percentage discounts
  start_date TIMESTAMP WITH TIME ZONE, -- Optional: Effective start date
  end_date TIMESTAMP WITH TIME ZONE, -- Optional: Expiry date
  usage_limit INTEGER, -- Optional: Max number of times it can be used
  usage_count INTEGER DEFAULT 0, -- Optional: Tracks current usage
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime for this table, only if it isn't already added
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'discounts') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.discounts;
  END IF;
END $$;

-- Add indexes for commonly queried columns
CREATE INDEX IF NOT EXISTS idx_discounts_code ON discounts (code);
CREATE INDEX IF NOT EXISTS idx_discounts_status ON discounts (status);
