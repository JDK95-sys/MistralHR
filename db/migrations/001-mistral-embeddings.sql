-- Migrate embedding column from OpenAI (1536 dims) to Mistral (1024 dims)
-- WARNING: Drops existing embeddings — re-run seed-policies.ts after applying.

ALTER TABLE document_chunks DROP COLUMN IF EXISTS embedding;
ALTER TABLE document_chunks ADD COLUMN embedding vector(1024);

DROP INDEX IF EXISTS idx_chunks_embedding;
CREATE INDEX idx_chunks_embedding
  ON document_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
