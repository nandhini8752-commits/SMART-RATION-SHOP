import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import pg, { QueryResultRow } from 'pg';
import { PGlite } from '@electric-sql/pglite';

dotenv.config();

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

export interface DbClient {
  query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>>;
}

let pgPool: pg.Pool | null = null;
let pgliteInstance: PGlite | null = null;
let initializationPromise: Promise<void> | null = null;

const isEmbedded = !process.env.DATABASE_URL || process.env.DATABASE_URL === 'embedded';

export async function initDb(): Promise<void> {
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    if (isEmbedded) {
      const dataDir = path.resolve(process.cwd(), 'data', 'pgdata');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      pgliteInstance = new PGlite(dataDir);
      await pgliteInstance.waitReady;
      console.log(`[Database] Connected to embedded PostgreSQL (PGlite) at ${dataDir}`);
    } else {
      pgPool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        max: 10,
        idleTimeoutMillis: 30000,
      });
      // Test connection
      const client = await pgPool.connect();
      client.release();
      console.log(`[Database] Connected to external PostgreSQL via DATABASE_URL`);
    }
  })();

  return initializationPromise;
}

export async function query<T extends QueryResultRow = any>(text: string, params: any[] = []): Promise<QueryResult<T>> {
  await initDb();

  if (isEmbedded && pgliteInstance) {
    const res = await pgliteInstance.query<T>(text, params);
    return {
      rows: res.rows || [],
      rowCount: res.affectedRows ?? res.rows.length,
    };
  }

  if (pgPool) {
    const res = await pgPool.query<T>(text, params);
    return {
      rows: res.rows || [],
      rowCount: res.rowCount ?? 0,
    };
  }

  throw new Error('[Database] No active database connection');
}

export async function exec(sql: string): Promise<void> {
  await initDb();

  if (isEmbedded && pgliteInstance) {
    await pgliteInstance.exec(sql);
    return;
  }

  if (pgPool) {
    await pgPool.query(sql);
    return;
  }

  throw new Error('[Database] No active database connection');
}

export async function transaction<T>(callback: (client: DbClient) => Promise<T>): Promise<T> {
  await initDb();

  if (isEmbedded && pgliteInstance) {
    return await pgliteInstance.transaction(async (tx) => {
      const txClient: DbClient = {
        query: async <R extends QueryResultRow = any>(text: string, params: any[] = []): Promise<QueryResult<R>> => {
          const res = await tx.query<R>(text, params);
          return {
            rows: res.rows || [],
            rowCount: res.affectedRows ?? res.rows.length,
          };
        },
      };
      return await callback(txClient);
    });
  }

  if (pgPool) {
    const client = await pgPool.connect();
    try {
      await client.query('BEGIN');
      const txClient: DbClient = {
        query: async <R extends QueryResultRow = any>(text: string, params: any[] = []): Promise<QueryResult<R>> => {
          const res = await client.query<R>(text, params);
          return {
            rows: res.rows || [],
            rowCount: res.rowCount ?? 0,
          };
        },
      };
      const result = await callback(txClient);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  throw new Error('[Database] No active database connection for transaction');
}

export async function isDatabaseReady(): Promise<boolean> {
  try {
    const res = await query('SELECT 1 as alive');
    return res.rows.length > 0 && res.rows[0].alive === 1;
  } catch (err) {
    console.error('[Database Readiness Error]:', err);
    return false;
  }
}

export async function closeDb(): Promise<void> {
  if (pgliteInstance) {
    await pgliteInstance.close();
    pgliteInstance = null;
  }
  if (pgPool) {
    await pgPool.end();
    pgPool = null;
  }
  initializationPromise = null;
}
