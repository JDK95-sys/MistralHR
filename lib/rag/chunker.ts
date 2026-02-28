// ─── Document Chunker ──────────────────────────────────────────────
// Splits large documents into overlapping chunks for embedding.
//
// Strategy:
// - Target: ~400 tokens per chunk (~1600 chars)
// - Overlap: ~50 tokens (~200 chars) to preserve context at boundaries
// - Split on paragraph/sentence boundaries where possible
//   (never cuts mid-sentence if avoidable)
//
// Why these numbers?
// - 400 tokens leaves ~3600 tokens for 6 retrieved chunks in context
// - Overlap prevents missing information at chunk edges
// - Sentence-aware splitting keeps coherent meaning per chunk

const CHUNK_TARGET_CHARS = 1600;  // ~400 tokens
const CHUNK_OVERLAP_CHARS = 200;  // ~50 tokens overlap

export interface TextChunk {
  content: string;
  chunkIndex: number;
  tokenEstimate: number;
}

// ─── Main chunker ──────────────────────────────────────────────────
export function chunkText(text: string, source?: string): TextChunk[] {
  // 1. Normalise whitespace
  const cleaned = text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")  // Collapse excess blank lines
    .replace(/[ \t]+/g, " ")     // Collapse inline spaces
    .trim();

  if (cleaned.length === 0) return [];

  // 2. Split into paragraphs first
  const paragraphs = cleaned
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 20); // Skip very short fragments

  // 3. Build chunks by accumulating paragraphs
  const chunks: TextChunk[] = [];
  let currentChunk = "";
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    // If a single paragraph exceeds target, split it by sentences
    if (paragraph.length > CHUNK_TARGET_CHARS) {
      // Flush current chunk first
      if (currentChunk.trim()) {
        chunks.push(makeChunk(currentChunk.trim(), chunkIndex++));
        // Keep overlap from end of current chunk
        currentChunk = getOverlap(currentChunk);
      }
      // Split long paragraph by sentences
      const sentenceChunks = splitBySentences(paragraph, chunkIndex);
      chunkIndex += sentenceChunks.length;
      chunks.push(...sentenceChunks);
      // Carry overlap from last sentence chunk
      if (sentenceChunks.length > 0) {
        currentChunk = getOverlap(sentenceChunks[sentenceChunks.length - 1].content);
      }
      continue;
    }

    // Would adding this paragraph exceed the target?
    if (
      currentChunk.length + paragraph.length + 2 > CHUNK_TARGET_CHARS &&
      currentChunk.trim().length > 0
    ) {
      chunks.push(makeChunk(currentChunk.trim(), chunkIndex++));
      // Start next chunk with overlap from previous
      currentChunk = getOverlap(currentChunk) + "\n\n" + paragraph;
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
    }
  }

  // Flush remaining content
  if (currentChunk.trim().length > 20) {
    chunks.push(makeChunk(currentChunk.trim(), chunkIndex++));
  }

  // Add source prefix to each chunk for better retrieval context
  if (source) {
    return chunks.map((c) => ({
      ...c,
      content: `[Source: ${source}]\n\n${c.content}`,
    }));
  }

  return chunks;
}

// ─── Split a long paragraph by sentences ──────────────────────────
function splitBySentences(text: string, startIndex: number): TextChunk[] {
  // Sentence boundary: ends with . ! ? followed by space+capital or end
  const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [text];
  const chunks: TextChunk[] = [];
  let current = "";
  let idx = startIndex;

  for (const sentence of sentences) {
    if (current.length + sentence.length > CHUNK_TARGET_CHARS && current.trim()) {
      chunks.push(makeChunk(current.trim(), idx++));
      current = getOverlap(current) + " " + sentence;
    } else {
      current += (current ? " " : "") + sentence;
    }
  }

  if (current.trim().length > 20) {
    chunks.push(makeChunk(current.trim(), idx));
  }

  return chunks;
}

// ─── Get trailing overlap from a chunk ────────────────────────────
function getOverlap(text: string): string {
  return text.slice(-CHUNK_OVERLAP_CHARS).trim();
}

// ─── Create a chunk object ─────────────────────────────────────────
function makeChunk(content: string, index: number): TextChunk {
  return {
    content,
    chunkIndex: index,
    tokenEstimate: Math.ceil(content.length / 4), // ~4 chars per token
  };
}

// ─── Stats helper ──────────────────────────────────────────────────
export function chunkStats(chunks: TextChunk[]) {
  const sizes = chunks.map((c) => c.tokenEstimate);
  return {
    count: chunks.length,
    avgTokens: Math.round(sizes.reduce((a, b) => a + b, 0) / sizes.length),
    minTokens: Math.min(...sizes),
    maxTokens: Math.max(...sizes),
    totalTokens: sizes.reduce((a, b) => a + b, 0),
  };
}
