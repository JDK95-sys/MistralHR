import { db } from "@/lib/db";
import { generateEmbedding, formatEmbedding } from "./embeddings";

// ─── Search result type ────────────────────────────────────────────
export interface SearchResult {
  id: string;
  documentId: string;
  content: string;
  docTitle: string;
  policyRef: string | null;
  countryCodes: string[];
  topic: string | null;
  effectiveDate: string | null;
  similarity: number;
}

// ─── Search options ────────────────────────────────────────────────
export interface SearchOptions {
  country: string;          // User's country from Azure AD session
  topK?: number;            // Number of chunks to retrieve (default: 6)
  threshold?: number;       // Minimum similarity score (default: 0.65)
  topic?: string;           // Optional topic filter
}

// ─── Main search function ──────────────────────────────────────────
// 1. Embeds the user's query
// 2. Runs the PostgreSQL search_chunks() function
//    which filters by country then ranks by cosine similarity
// 3. Returns ranked chunks with source metadata
export async function searchDocuments(
  query: string,
  options: SearchOptions
): Promise<SearchResult[]> {
  const { country, topK = 6, threshold = 0.65, topic } = options;

  // Generate query embedding
  const embedding = await generateEmbedding(query);
  const embeddingStr = formatEmbedding(embedding);

  // Call the search function defined in schema.sql
  const result = await db!.query<{
    id: string;
    document_id: string;
    content: string;
    doc_title: string;
    policy_ref: string | null;
    country_codes: string[];
    topic: string | null;
    effective_date: string | null;
    similarity: number;
  }>(
    `SELECT * FROM search_chunks(
      $1::vector,
      $2::text,
      $3::float,
      $4::int,
      $5::text
    )`,
    [embeddingStr, country, threshold, topK, topic ?? null]
  );

  return result.rows.map((row) => ({
    id: row.id,
    documentId: row.document_id,
    content: row.content,
    docTitle: row.doc_title,
    policyRef: row.policy_ref,
    countryCodes: row.country_codes,
    topic: row.topic,
    effectiveDate: row.effective_date,
    similarity: row.similarity,
  }));
}

// ─── Format retrieved chunks into an LLM context string ───────────
// This is injected into the system prompt before the user's question.
export function buildContext(chunks: SearchResult[]): string {
  if (chunks.length === 0) {
    return "No relevant HR policy documents found for this query.";
  }

  return chunks
    .map((chunk, i) => {
      const meta = [
        `Document: ${chunk.docTitle}`,
        chunk.policyRef ? `Reference: ${chunk.policyRef}` : null,
        chunk.effectiveDate
          ? `Effective: ${new Date(chunk.effectiveDate).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}`
          : null,
        `Countries: ${chunk.countryCodes.includes("GLOBAL") ? "All countries" : chunk.countryCodes.join(", ")}`,
      ]
        .filter(Boolean)
        .join(" | ");

      return `[Context ${i + 1}] ${meta}\n${chunk.content}`;
    })
    .join("\n\n---\n\n");
}

// ─── Build source citations for the UI ────────────────────────────
export interface Citation {
  chunkId: string;
  docTitle: string;
  policyRef: string | null;
  effectiveDate: string | null;
}

export function buildCitations(chunks: SearchResult[]): Citation[] {
  // Deduplicate by document title
  const seen = new Set<string>();
  return chunks
    .filter((c) => {
      if (seen.has(c.docTitle)) return false;
      seen.add(c.docTitle);
      return true;
    })
    .map((c) => ({
      chunkId: c.id,
      docTitle: c.docTitle,
      policyRef: c.policyRef,
      effectiveDate: c.effectiveDate,
    }));
}
