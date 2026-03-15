-- Run this in your Vercel Postgres dashboard (or any Postgres) if you set POSTGRES_URL for analytics persistence.
-- Requires: users table (from docs/schema-memory.sql) to exist first for the user_id foreign key.
CREATE TABLE IF NOT EXISTS analytics_events (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  props JSONB,
  timestamp BIGINT,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optional: add user_id to existing table if you already created it without user_id:
-- ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;
