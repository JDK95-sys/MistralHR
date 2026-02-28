import { Mistral } from "@mistralai/mistralai";

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY! });

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await mistral.embeddings.create({
    model: "mistral-embed",
    inputs: [text],
  });
  const embedding = response.data[0]?.embedding;
  if (!embedding) {
    throw new Error("Failed to generate embedding");
  }
  return embedding;
}

export async function generateEmbeddingsBatch(
  texts: string[]
): Promise<number[][]> {
  const response = await mistral.embeddings.create({
    model: "mistral-embed",
    inputs: texts,
  });
  return response.data.map((d) => {
    if (!d.embedding) {
      throw new Error("Failed to generate embedding for batch item");
    }
    return d.embedding;
  });
}

export function formatEmbedding(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}
