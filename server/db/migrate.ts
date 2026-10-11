import fs from 'fs';
import path from 'path';
import { exec, closeDb, query } from './connection';

export async function runMigrations() {
  console.log('[Migration] Starting database migration...');
  const schemaPath = path.resolve(process.cwd(), 'database', 'schema.sql');

  if (!fs.existsSync(schemaPath)) {
    throw new Error(`[Migration] schema.sql not found at ${schemaPath}`);
  }

  let schemaSql = fs.readFileSync(schemaPath, 'utf-8');

  // PostgreSQL 13+ and PGlite (PG16) have native gen_random_uuid(), pgcrypto is optional/external
  schemaSql = schemaSql.replace(/CREATE EXTENSION IF NOT EXISTS pgcrypto;/gi, '-- CREATE EXTENSION IF NOT EXISTS pgcrypto; (native in PG16)');

  try {
    await exec(schemaSql);
    console.log('[Migration] Successfully executed database/schema.sql');

    // Verify key tables exist
    const tablesCheck = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    const tableNames = tablesCheck.rows.map((r: any) => r.table_name);
    console.log(`[Migration] Verified ${tableNames.length} tables in database: ${tableNames.join(', ')}`);
  } catch (err) {
    console.error('[Migration] Failed to execute migrations:', err);
    throw err;
  }
}

// Allow standalone execution via tsx server/db/migrate.ts
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}` || process.argv[1].endsWith('migrate.ts')) {
  runMigrations()
    .then(async () => {
      console.log('[Migration] Migration complete.');
      await closeDb();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('[Migration] Fatal error:', err);
      await closeDb();
      process.exit(1);
    });
}
