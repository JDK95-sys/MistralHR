import { Pool, QueryResultRow } from "pg";

// ─── Singleton connection pool ─────────────────────────────────────
// Re-uses the pool across hot-reloads in dev and across requests in prod.
// Azure Database for PostgreSQL requires SSL.
// If DATABASE_URL is not set, the pool is null and queries will fail gracefully.

declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
}

function createPool(): Pool | null {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.warn(
      "[DB] DATABASE_URL is not set — database features are disabled. " +
      "See .env.example for setup instructions."
    );
    return null;
  }

  const pool = new Pool({
    connectionString,
    ssl: {
      // Azure Database for PostgreSQL requires SSL
      rejectUnauthorized: process.env.NODE_ENV === "production",
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  pool.on("error", (err) => {
    console.error("PostgreSQL pool error:", err);
  });

  return pool;
}

// In dev, reuse pool across Next.js hot reloads
const _pool =
  process.env.NODE_ENV === "development"
    ? (global._pgPool ?? (global._pgPool = createPool() ?? undefined))
    : createPool();

export const db: Pool | null = _pool ?? null;

// ─── Helpers ───────────────────────────────────────────────────────

/** Returns true if the database is configured and available */
export function isDbAvailable(): boolean {
  return db !== null;
}

export async function query<T extends QueryResultRow = any>(
  sql: string,
  params?: unknown[]
) {
  if (!db) {
    throw new Error("Database is not configured. Set DATABASE_URL in .env.local");
  }
  const result = await db.query<T>(sql, params);
  return result;
}

// Verify connectivity (used in health check)
export async function ping(): Promise<boolean> {
  if (!db) return false;
  try {
    await db.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}
