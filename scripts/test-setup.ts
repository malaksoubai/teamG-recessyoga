

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { sql } from 'drizzle-orm';
import * as schema from '../app/db/schema';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle(pool, { schema });

async function main() {
  console.log('\n Testing your backend setup...\n');

  //  1. DB Connection 
  try {
    await db.execute(sql`SELECT 1`);
    console.log(' 1. Database connection: OK');
  } catch (e) {
    console.error(' 1. Database connection FAILED:', e);
    console.error('   → Check your DATABASE_URL in .env.local');
    process.exit(1);
  }

  //  2. class_types seeded 
  try {
    const classTypes = await db.query.classTypes.findMany();
    if (classTypes.length === 0) {
      console.error(' 2. class_types table is EMPTY');
      console.error('   → Run the seed SQL (002_seed_class_types.sql) in Supabase SQL Editor');
    } else {
      console.log(` 2. class_types seeded: ${classTypes.length} types found`);
      classTypes.forEach((ct) => console.log(`      - ${ct.name}`));
    }
  } catch (e) {
    console.error(' 2. Could not query class_types:', e);
  }

  //  3. profiles table accessible 
  try {
    const count = await db.execute(
      sql`SELECT COUNT(*) FROM public.profiles`
    );
    console.log(` 3. profiles table: accessible (${(count.rows[0] as { count: string }).count} rows)`);
  } catch (e) {
    console.error(' 3. profiles table not accessible:', e);
  }

  //  4. RLS enabled check 
  try {
    const rlsCheck = await db.execute(sql`
      SELECT tablename, rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename IN ('profiles', 'class_types', 'locations', 'coverage_requests', 'instructor_qualifications')
      ORDER BY tablename
    `);
    type RLSRow = { tablename: string; rowsecurity: boolean };
    const rows = rlsCheck.rows as RLSRow[];
    const allOn = rows.every((r) => r.rowsecurity);
    if (allOn) {
      console.log('4. RLS enabled on all tables');
    } else {
      console.log(' 4. RLS check — some tables:');
      rows.forEach((r) => {
        console.log(`      ${r.tablename}: RLS ${r.rowsecurity ? 'ON' : 'OFF'}`);
      });
      console.log('   → Run 001_rls_policies.sql in Supabase SQL Editor');
    }
  } catch (e) {
    console.error(' 4. Could not check RLS status:', e);
  }

  console.log('\n🏁 Done.\n');
  await pool.end();
}

main();
