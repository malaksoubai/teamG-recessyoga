/**
 * Drizzle ORM database client.
 *
 * Exports a single `db` instance used by all tRPC routers.
 * Uses the node-postgres (pg) driver which is already installed.
 *
 * DATABASE_URL must be set in .env.local and should point to your
 * Supabase "Session mode" pooler connection string (port 5432).
 */

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@/app/db/schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

export const db = drizzle(pool, { schema });

/** Same tables as `db` — for queries that need explicit table refs (e.g. aliases). */
export { schema };
