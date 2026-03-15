-- Long-Term Memory & Agentic RAG schema (Postgres + pgvector)
-- Run in your Postgres (e.g. Neon, Vercel Postgres, Supabase) after enabling pgvector.

CREATE EXTENSION IF NOT EXISTS vector;

-- Core User Profile (align with NextAuth: upsert on sign-in)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  target_industry VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW()
);

-- Episodic Memory: one row per completed interview
CREATE TABLE IF NOT EXISTS session_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_type VARCHAR(50) NOT NULL DEFAULT 'mock_interview',
  raw_transcript TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_session_logs_user_id ON session_logs(user_id);

-- Competency Matrix (NACE-aligned)
CREATE TABLE IF NOT EXISTS competencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT
);

-- Semantic Memory: extracted insights with embeddings
CREATE TABLE IF NOT EXISTS session_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES session_logs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  competency_id UUID REFERENCES competencies(id),
  score INTEGER CHECK (score >= 1 AND score <= 5),
  insight_type VARCHAR(50) NOT NULL,
  evidence_quote TEXT,
  socratic_feedback_given TEXT,
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_session_insights_user_id ON session_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_session_insights_competency_id ON session_insights(competency_id);
CREATE INDEX IF NOT EXISTS idx_session_insights_created_at ON session_insights(created_at DESC);

-- Vector similarity search (ivfflat; use lists proportional to row count, min 1)
CREATE INDEX IF NOT EXISTS idx_session_insights_embedding ON session_insights
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Seed NACE-aligned competencies (idempotent)
INSERT INTO competencies (category, name, description) VALUES
  ('Communication', 'Communication', 'Clear verbal and written communication'),
  ('Communication', 'STAR Method Structuring', 'Structuring answers with Situation, Task, Action, Result'),
  ('Behavioral', 'Leadership', 'Leading others and taking initiative'),
  ('Behavioral', 'Teamwork', 'Collaboration and team effectiveness'),
  ('Behavioral', 'Conflict Resolution', 'Handling disagreement and difficult conversations'),
  ('Behavioral', 'Problem Solving', 'Analyzing problems and proposing solutions'),
  ('Behavioral', 'Adaptability', 'Handling change and ambiguity'),
  ('Behavioral', 'Quantifying Impact', 'Using numbers and outcomes to describe impact'),
  ('Behavioral', 'Passive Language Avoidance', 'Using active voice and ownership in answers')
ON CONFLICT (name) DO NOTHING;
