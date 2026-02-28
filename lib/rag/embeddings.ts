import { Mistral } from "@mistralai/mistralai";

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY! });

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await mistral.embeddings.create({
    model: "mistral-embed",
    inputs: [text],
  });
  return response.data[0].embedding!;
}

export async function generateEmbeddingsBatch(
  texts: string[]
): Promise<number[][]> {
  const response = await mistral.embeddings.create({
    model: "mistral-embed",
    inputs: texts,
  });
  return response.data.map((d) => d.embedding!);
}

export function formatEmbedding(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}
