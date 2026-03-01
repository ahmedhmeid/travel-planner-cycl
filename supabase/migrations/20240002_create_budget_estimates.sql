-- Migration: budget_estimates (cache) and trip_budgets (saved estimates)
-- Creates tables for the Trip Budget Estimator feature

-- budget_estimates: caches AI-generated per-destination cost estimates (24h TTL)
CREATE TABLE IF NOT EXISTS budget_estimates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destination text NOT NULL,
  style text NOT NULL,           -- 'budget' | 'mid-range' | 'luxury'
  duration_days int NOT NULL,
  line_items jsonb NOT NULL,     -- [{ label, perPerson }]
  grand_total_per_person numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT budget_estimates_unique_key UNIQUE (destination, style, duration_days)
);

-- trip_budgets: saves a specific estimate to a trip record
CREATE TABLE IF NOT EXISTS trip_budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  travelers int NOT NULL DEFAULT 1,
  duration_days int NOT NULL,
  style text NOT NULL,
  line_items jsonb NOT NULL,     -- [{ label, perPerson, total }]
  grand_total numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  saved_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS trip_budgets_trip_id_idx ON trip_budgets(trip_id);

-- Enable Row Level Security
ALTER TABLE budget_estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_budgets ENABLE ROW LEVEL SECURITY;

-- budget_estimates: public read (no PII), service role handles writes via API
CREATE POLICY "budget_estimates_public_read" ON budget_estimates
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow API route (service role) to insert/update via upsert
CREATE POLICY "budget_estimates_service_insert" ON budget_estimates
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "budget_estimates_service_update" ON budget_estimates
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- trip_budgets: full access for anon/authenticated (no auth yet, consistent with other tables)
CREATE POLICY "trip_budgets_anon_all" ON trip_budgets
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "trip_budgets_authenticated_all" ON trip_budgets
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
