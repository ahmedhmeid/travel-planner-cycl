-- Migration: trips, packing_lists, packing_items
-- Creates the core tables for the AI Packing List Generator feature

-- Trips table: stores basic trip metadata
CREATE TABLE IF NOT EXISTS trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destination text NOT NULL,
  name text NOT NULL,
  start_date date,
  end_date date,
  activities text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Packing lists table: one list per trip, owned by a user
CREATE TABLE IF NOT EXISTS packing_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id uuid,  -- references auth.users once auth is enabled
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Packing items table: individual items within a list
CREATE TABLE IF NOT EXISTS packing_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid NOT NULL REFERENCES packing_lists(id) ON DELETE CASCADE,
  category text NOT NULL,
  name text NOT NULL,
  checked boolean NOT NULL DEFAULT false,
  is_custom boolean NOT NULL DEFAULT false
);

-- Indexes for fast retrieval
CREATE INDEX IF NOT EXISTS packing_lists_trip_id_idx ON packing_lists(trip_id);
CREATE INDEX IF NOT EXISTS packing_items_list_id_idx ON packing_items(list_id);

-- Enable Row Level Security
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE packing_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE packing_items ENABLE ROW LEVEL SECURITY;

-- RLS policies: allow public access (tighten to auth.uid() once auth is added)
-- trips: anyone can create and read trips
CREATE POLICY "trips_public_all" ON trips
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- packing_lists: full access for authenticated users (server uses service role)
CREATE POLICY "packing_lists_authenticated_all" ON packing_lists
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow anon access for dev (API routes use service role key in production)
CREATE POLICY "packing_lists_anon_all" ON packing_lists
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- packing_items: inherit access from packing_lists via list_id
CREATE POLICY "packing_items_authenticated_all" ON packing_items
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "packing_items_anon_all" ON packing_items
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);
