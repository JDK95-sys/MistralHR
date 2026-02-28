-- ═══════════════════════════════════════════════════════════════
-- HR Assistant — Database Schema
-- PostgreSQL 15 + pgvector extension
-- ═══════════════════════════════════════════════════════════════

-- Enable pgvector extension (required once per database)
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ──────────────────────────────────────────────────────────────
-- 1. HR DOCUMENTS
--    Stores metadata about every uploaded policy document.
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hr_documents (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT        NOT NULL,
  description     TEXT,
  file_name       TEXT        NOT NULL,
  file_type       TEXT        NOT NULL,           -- 'pdf' | 'docx' | 'txt' | 'xlsx'
  file_size_bytes INTEGER,
  blob_url        TEXT        DEFAULT '',           -- Storage URL (empty for seeded policies)
  blob_path       TEXT        DEFAULT '',           -- Storage path (empty for seeded policies)

  -- Country scoping — which countries this document applies to.
  -- NULL or empty = global (applies to all countries).
  -- Stored as array for multi-country policies.
  -- e.g. ARRAY['Belgium', 'Netherlands'] or ARRAY['GLOBAL']
  country_codes   TEXT[]      NOT NULL DEFAULT ARRAY['GLOBAL'],

  -- Document metadata
  topic           TEXT,                            -- 'leave' | 'expenses' | 'benefits' | etc.
  language        TEXT        NOT NULL DEFAULT 'en',
  doc_version     TEXT,
  effective_date  DATE,
  expiry_date     DATE,
  policy_ref      TEXT,                            -- e.g. 'BE-HR-POL-2024-07'

  -- Processing state
  status          TEXT        NOT NULL DEFAULT 'pending',
  -- 'pending' → 'processing' → 'ready' | 'failed'
  chunk_count     INTEGER     DEFAULT 0,
  error_message   TEXT,

  -- Audit
  uploaded_by     TEXT        NOT NULL,            -- User email from Azure AD
  uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for country lookups (used on every chat query)
CREATE INDEX IF NOT EXISTS idx_documents_countries
  ON hr_documents USING GIN (country_codes);

CREATE INDEX IF NOT EXISTS idx_documents_status
  ON hr_documents (status);

CREATE INDEX IF NOT EXISTS idx_documents_topic
  ON hr_documents (topic);

-- ──────────────────────────────────────────────────────────────
-- 2. DOCUMENT CHUNKS
--    Each document is split into overlapping text chunks.
--    Each chunk has a 1024-dimensional embedding vector
--    (Mistral mistral-embed).
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS document_chunks (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id     UUID        NOT NULL REFERENCES hr_documents(id) ON DELETE CASCADE,

  -- The actual text content of this chunk
  content         TEXT        NOT NULL,

  -- Position within the document
  chunk_index     INTEGER     NOT NULL,
  token_count     INTEGER,

  -- Inherited from parent document for fast filtering without JOIN
  country_codes   TEXT[]      NOT NULL DEFAULT ARRAY['GLOBAL'],
  topic           TEXT,
  language        TEXT        NOT NULL DEFAULT 'en',
  policy_ref      TEXT,
  doc_title       TEXT        NOT NULL,
  effective_date  DATE,

  -- Mistral mistral-embed (1024 dimensions)
  embedding       vector(1024),

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Vector similarity index ──────────────────────────────────
-- Uses IVFFlat for approximate nearest-neighbour search.
-- Tune lists= based on dataset size:
--   < 1M rows: lists = sqrt(rows)
--   > 1M rows: lists = rows / 1000
-- For initial deployment with ~100k chunks: lists = 100
CREATE INDEX IF NOT EXISTS idx_chunks_embedding
  ON document_chunks USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Index for country filtering (pre-filter before vector search)
CREATE INDEX IF NOT EXISTS idx_chunks_countries
  ON document_chunks USING GIN (country_codes);

CREATE INDEX IF NOT EXISTS idx_chunks_document_id
  ON document_chunks (document_id);

CREATE INDEX IF NOT EXISTS idx_chunks_topic
  ON document_chunks (topic);

-- ──────────────────────────────────────────────────────────────
-- 3. CHAT HISTORY
--    Stores conversation history per user for context window.
--    Retained for 90 days then purged automatically.
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_sessions (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         TEXT        NOT NULL,            -- Azure AD user ID (sub)
  user_email      TEXT        NOT NULL,
  user_country    TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id      UUID        NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role            TEXT        NOT NULL CHECK (role IN ('user', 'assistant')),
  content         TEXT        NOT NULL,

  -- Sources cited in this assistant message
  source_chunks   UUID[],                          -- Array of chunk IDs used

  -- Metadata
  model           TEXT,                            -- e.g. 'open-mistral-nemo'
  tokens_used     INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_session
  ON chat_messages (session_id, created_at);

CREATE INDEX IF NOT EXISTS idx_sessions_user
  ON chat_sessions (user_id, last_active);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER documents_updated_at
  BEFORE UPDATE ON hr_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ──────────────────────────────────────────────────────────────
-- 4. SEARCH FUNCTION
--    Combines country filtering with vector similarity search.
--    Called from lib/rag/vectorSearch.ts
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION search_chunks(
  query_embedding   vector(1024),
  user_country      TEXT,
  match_threshold   FLOAT    DEFAULT 0.65,
  match_count       INT      DEFAULT 6,
  filter_topic      TEXT     DEFAULT NULL
)
RETURNS TABLE (
  id              UUID,
  document_id     UUID,
  content         TEXT,
  doc_title       TEXT,
  policy_ref      TEXT,
  country_codes   TEXT[],
  topic           TEXT,
  effective_date  DATE,
  similarity      FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.document_id,
    c.content,
    c.doc_title,
    c.policy_ref,
    c.country_codes,
    c.topic,
    c.effective_date,
    1 - (c.embedding <=> query_embedding) AS similarity
  FROM document_chunks c
  WHERE
    -- Country filter: match user's country OR global documents
    (c.country_codes @> ARRAY[user_country] OR c.country_codes @> ARRAY['GLOBAL'])
    -- Optional topic filter
    AND (filter_topic IS NULL OR c.topic = filter_topic)
    -- Minimum similarity threshold
    AND 1 - (c.embedding <=> query_embedding) > match_threshold
    -- Only from documents that are fully processed
    AND EXISTS (
      SELECT 1 FROM hr_documents d
      WHERE d.id = c.document_id AND d.status = 'ready'
    )
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ──────────────────────────────────────────────────────────────
-- 5. SEED DATA — Document topics enum (reference only)
-- ──────────────────────────────────────────────────────────────
-- Valid topic values:
-- 'leave'         → Parental, annual, sick leave
-- 'expenses'      → Expense claims and reimbursements
-- 'benefits'      → Health insurance, pension, perks
-- 'remote-work'   → WFH / hybrid policies
-- 'onboarding'    → New joiner guides
-- 'performance'   → Review cycles, goal setting
-- 'compensation'  → Salary, bands, pay equity
-- 'code-of-conduct' → Ethics, compliance
-- 'offboarding'   → Resignation, termination
-- 'training'      → L&D, certifications
-- 'other'         → Catch-all
