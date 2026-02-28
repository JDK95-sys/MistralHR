-- Remove NOT NULL constraint from blob columns (legacy Azure Blob Storage references).
-- These columns are not used by the seed script or the Mistral-native RAG pipeline.

ALTER TABLE hr_documents ALTER COLUMN blob_url DROP NOT NULL;
ALTER TABLE hr_documents ALTER COLUMN blob_url SET DEFAULT '';
ALTER TABLE hr_documents ALTER COLUMN blob_path DROP NOT NULL;
ALTER TABLE hr_documents ALTER COLUMN blob_path SET DEFAULT '';
