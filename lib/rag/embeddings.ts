import { Mistral } from "@mistralai/mistralai";

const apiKey = process.env.MISTRAL_API_KEY;
if (!apiKey) {
  throw new Error(
    "[MistralHR] MISTRAL_API_KEY is not set. " +
    "Set it in .env.local for local development or in your hosting platform's environment variables."
  );
}
const mistral = new Mistral({ apiKey });

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
