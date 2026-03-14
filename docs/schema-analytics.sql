-- Run this in your Vercel Postgres dashboard (or any Postgres) if you set POSTGRES_URL for analytics persistence.
CREATE TABLE IF NOT EXISTS analytics_events (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  props JSONB,
  timestamp BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
