/**
 * Seed script — inserts FR/BE statutory policy content into the database
 * with Mistral embeddings for RAG chat.
 *
 * Usage:
 *   MISTRAL_API_KEY=<key> DATABASE_URL=<url> npx ts-node --project tsconfig.json scripts/seed-policies.ts
 *
 * Run the DB migration first:
 *   psql $DATABASE_URL -f db/migrations/001-mistral-embeddings.sql
 */

import { Pool } from "pg";
import { getPoliciesForCountry, SUPPORTED_COUNTRIES } from "../lib/policies";
import { generateEmbedding, formatEmbedding } from "../lib/rag/embeddings";

if (!process.env.MISTRAL_API_KEY) {
  console.error(
    "❌ MISTRAL_API_KEY is not set. Cannot generate embeddings without it.\n" +
    "   Set it in .env.local or pass it inline:\n" +
    "   MISTRAL_API_KEY=<key> DATABASE_URL=<url> npx ts-node --project tsconfig.json scripts/seed-policies.ts"
  );
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error(
    "❌ DATABASE_URL is not set. Cannot seed the database without it.\n" +
    "   Set it in .env.local or pass it inline:\n" +
    "   MISTRAL_API_KEY=<key> DATABASE_URL=<url> npx ts-node --project tsconfig.json scripts/seed-policies.ts"
  );
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

async function seed() {
  const client = await pool.connect();
  const policies = SUPPORTED_COUNTRIES.flatMap(c => getPoliciesForCountry(c));
  
  try {
    await client.query("BEGIN");

    // Clear previously seeded policies so re-runs are idempotent
    await client.query(
      "DELETE FROM hr_documents WHERE uploaded_by = $1",
      ["seed-script@mistralhr.demo"]
    );

    for (const policy of policies) {
      const country = policy.country;
      const language = country === "France" ? "fr" : "nl";

      // Insert parent document record
      const docResult = await client.query<{ id: string }>(
        `INSERT INTO hr_documents
           (title, description, file_name, file_type, file_size_bytes,
            country_codes, topic, language, policy_ref, status, chunk_count,
            uploaded_by)
         VALUES ($1, $2, $3, 'txt', $4, $5, $6, $7, $8, 'ready', 1,
                 'seed-script@mistralhr.demo')
         RETURNING id`,
        [
          policy.title,
          policy.description,
          `${policy.id}.txt`,
          Buffer.byteLength(policy.content, "utf8"),
          [country],
          policy.topic,
          language,
          policy.legalRefs?.[0] ?? policy.id,
        ]
      );
      const docId = docResult.rows[0].id;

      // Generate Mistral embedding for the combined policy text
      const textToEmbed = `${policy.title}\n\n${policy.description}\n\n${policy.content}`;
      const embedding = await generateEmbedding(textToEmbed);

      // Insert chunk
      await client.query(
        `INSERT INTO document_chunks
           (document_id, content, chunk_index, token_count, country_codes,
            topic, language, policy_ref, doc_title, embedding)
         VALUES ($1, $2, 0, $3, $4, $5, $6, $7, $8, $9::vector)`,
        [
          docId,
          policy.content,
          Math.ceil(policy.content.length / 4), // rough token estimate
          [country],
          policy.topic,
          language,
          policy.legalRefs?.[0] ?? policy.id,
          policy.title,
          formatEmbedding(embedding),
        ]
      );

      console.log(`✓ Seeded: ${policy.title}`);
    }

    await client.query("COMMIT");
    console.log(`\n✅ All ${policies.length} policies seeded successfully.`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Seed failed:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
