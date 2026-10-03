import fs from 'fs';
import path from 'path';
import { Pool, QueryResultRow } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error('[db] FATAL: DATABASE_URL is not set.');
  process.exit(1);
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

// Fired when an *idle* client errors (e.g. db container restarted).
// Without this listener, pg would emit an unhandled 'error' and crash Node.
pool.on('error', (err) => {
  console.error('[db] Unexpected error on idle PostgreSQL client:', err.message);
});

export function query<T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]) {
  return pool.query<T>(text, params);
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Waits for PostgreSQL to accept connections, then applies schema.sql.
 * Retries so the API survives a db that is still booting.
 */
export async function initDb(retries = 10, delayMs = 2_000): Promise<void> {
  const schemaPath = path.resolve(__dirname, '..', 'schema.sql');

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const client = await pool.connect();
      try {
        const { rows } = await client.query<{ db: string; version: string }>(
          'SELECT current_database() AS db, version() AS version',
        );
        console.log(`[db] Connected to "${rows[0].db}" (${rows[0].version.split(',')[0]})`);

        if (fs.existsSync(schemaPath)) {
          await client.query(fs.readFileSync(schemaPath, 'utf8'));
          console.log('[db] Schema applied (users table ready).');
        } else {
          console.warn(`[db] schema.sql not found at ${schemaPath}; skipping migration.`);
        }
      } finally {
        client.release();
      }
      return;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[db] Connection attempt ${attempt}/${retries} failed: ${message}`);
      if (attempt === retries) throw err;
      await sleep(delayMs);
    }
  }
}
