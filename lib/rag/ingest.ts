import { db } from "@/lib/db";
import { parseDocument } from "./parser";
import { chunkText, chunkStats } from "./chunker";
import { generateEmbeddingsBatch, formatEmbedding } from "./embeddings";

// ─── Ingest options ────────────────────────────────────────────────
export interface IngestOptions {
  documentId: string;   // Pre-created hr_documents row ID
  buffer: Buffer;
  fileName: string;
  docTitle: string;
  policyRef?: string;
  countryCodes: string[];
  topic?: string;
  language?: string;
  effectiveDate?: string;
  uploadedBy: string;
}

export interface IngestResult {
  success: boolean;
  chunkCount: number;
  wordCount: number;
  error?: string;
}

// ─── Main ingestion pipeline ───────────────────────────────────────
// Steps:
//  1. Parse file → plain text
//  2. Chunk text → overlapping segments
//  3. Generate embeddings in batch
//  4. Bulk INSERT chunks into database
//  5. Update document status → 'ready'
//
// Any failure marks the document status as 'failed'
// so the admin knows to re-upload.

export async function ingestDocument(
  options: IngestOptions
): Promise<IngestResult> {
  const {
    documentId,
    buffer,
    fileName,
    docTitle,
    policyRef,
    countryCodes,
    topic,
    language = "en",
    effectiveDate,
  } = options;

  try {
    // ── Step 1: Mark as processing ─────────────────────────────
    await db!.query(
      "UPDATE hr_documents SET status = 'processing' WHERE id = $1",
      [documentId]
    );

    // ── Step 2: Parse document ─────────────────────────────────
    console.log(`[Ingest] Parsing ${fileName}...`);
    const parsed = await parseDocument(buffer, fileName);
    console.log(`[Ingest] Parsed: ${parsed.wordCount} words, type: ${parsed.fileType}`);

    if (parsed.text.trim().length < 50) {
      throw new Error("Document appears to be empty or unreadable after parsing.");
    }

    // ── Step 3: Chunk text ─────────────────────────────────────
    const sourceLabel = policyRef ?? docTitle;
    const chunks = chunkText(parsed.text, sourceLabel);
    const stats = chunkStats(chunks);

    console.log(
      `[Ingest] Chunked into ${stats.count} chunks, ` +
      `avg ${stats.avgTokens} tokens, total ${stats.totalTokens} tokens`
    );

    if (chunks.length === 0) {
      throw new Error("No content chunks generated from document.");
    }

    // ── Step 4: Generate embeddings ────────────────────────────
    console.log(`[Ingest] Generating ${chunks.length} embeddings...`);
    const texts = chunks.map((c) => c.content);
    const embeddings = await generateEmbeddingsBatch(texts);
    console.log(`[Ingest] Embeddings complete.`);

    // ── Step 5: Bulk insert chunks ─────────────────────────────
    // Build VALUES string for bulk insert
    // Using a transaction to ensure atomicity
    const client = await db!.connect();
    try {
      await client.query("BEGIN");

      // Delete any existing chunks (in case of re-ingestion)
      await client.query(
        "DELETE FROM document_chunks WHERE document_id = $1",
        [documentId]
      );

      // Bulk insert all chunks
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const embedding = formatEmbedding(embeddings[i]);

        await client.query(
          `INSERT INTO document_chunks (
            document_id, content, chunk_index, token_count,
            country_codes, topic, language, policy_ref, doc_title,
            effective_date, embedding
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::vector)`,
          [
            documentId,
            chunk.content,
            chunk.chunkIndex,
            chunk.tokenEstimate,
            countryCodes,
            topic ?? null,
            language,
            policyRef ?? null,
            docTitle,
            effectiveDate ?? null,
            embedding,
          ]
        );
      }

      // Update document status to 'ready'
      await client.query(
        `UPDATE hr_documents
         SET status = 'ready', chunk_count = $1, updated_at = NOW()
         WHERE id = $2`,
        [chunks.length, documentId]
      );

      await client.query("COMMIT");
      console.log(`[Ingest] ✅ Document ${documentId} ingested with ${chunks.length} chunks.`);
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }

    return {
      success: true,
      chunkCount: chunks.length,
      wordCount: parsed.wordCount,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`[Ingest] ❌ Failed for document ${documentId}:`, errorMessage);

    // Mark document as failed
    await db!.query(
      `UPDATE hr_documents
       SET status = 'failed', error_message = $1, updated_at = NOW()
       WHERE id = $2`,
      [errorMessage, documentId]
    );

    return {
      success: false,
      chunkCount: 0,
      wordCount: 0,
      error: errorMessage,
    };
  }
}
