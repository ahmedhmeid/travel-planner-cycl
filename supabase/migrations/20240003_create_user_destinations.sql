-- Migration: user_destinations table for the Bucket List feature
-- Stores countries a user wants to visit (wishlist) or has already visited

CREATE TABLE IF NOT EXISTS user_destinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL DEFAULT 'anonymous',
  country_code text NOT NULL,                   -- ISO 3166-1 alpha-2 (e.g. 'FR', 'JP')
  status text NOT NULL CHECK (status IN ('wishlist', 'visited')),
  added_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_destinations_unique_country UNIQUE (user_id, country_code)
);

CREATE INDEX IF NOT EXISTS user_destinations_user_id_idx ON user_destinations (user_id);

-- Enable Row Level Security
ALTER TABLE user_destinations ENABLE ROW LEVEL SECURITY;

-- Allow anon and authenticated roles to read/write their own rows
-- (No session-based auth yet; policies match existing table pattern)
CREATE POLICY "user_destinations_anon_all" ON user_destinations
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "user_destinations_authenticated_all" ON user_destinations
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
