/**
 * Test "Pending approvals" without Supabase Dashboard or email/SMS verification.
 *
 * Uses DATABASE_URL (direct Postgres), same idea as `seed-open-coverage-request.ts`.
 *
 * ── Option A — flip an existing instructor back to "pending" (no extra auth user)
 *   Pick any profile email that already exists and is normally approved.
 *   That account will behave like a new sign-up until you restore it.
 *
 *     SEED_PENDING_FLIP_EMAIL=colleague@example.com npm run db:seed:pending-instructor
 *
 *   Restore (after UI testing):
 *
 *     SEED_PENDING_RESTORE_EMAIL=colleague@example.com npm run db:seed:pending-instructor
 *
 * ── Option B — create a brand-new auth user + profile (skips inbox; needs service role)
 *   Add SUPABASE_SERVICE_ROLE_KEY to .env.local (Project Settings → API in Supabase).
 *   The script confirms the email server-side and inserts `profiles`.
 *
 *     SEED_PENDING_NEW_EMAIL=test-pending-001@yourdomain.com \
 *     SEED_PENDING_NEW_PASSWORD='YourLongPassword1!' \
 *     npm run db:seed:pending-instructor -- create
 *
 *   (Pass `create` as the first CLI argument, or set SEED_PENDING_CREATE=1)
 */

import { config } from "dotenv"

config({ path: ".env.local" })
config({ path: ".env" })

import { createClient } from "@supabase/supabase-js"
import { drizzle } from "drizzle-orm/node-postgres"
import { eq, sql } from "drizzle-orm"
import { Pool } from "pg"

import * as schema from "@/app/db/schema"

function requireEnv(name: string): string {
  const v = process.env[name]?.trim()
  if (!v) {
    console.error(`Missing ${name}. Set it in .env / .env.local or the shell.`)
    process.exit(1)
  }
  return v
}

function wantCreate(): boolean {
  const arg = process.argv[2]?.toLowerCase()
  return arg === "create" || process.env.SEED_PENDING_CREATE === "1"
}

async function flipToPending() {
  const databaseUrl = requireEnv("DATABASE_URL")
  const email = requireEnv("SEED_PENDING_FLIP_EMAIL")
  const pool = new Pool({ connectionString: databaseUrl })
  const db = drizzle(pool, { schema })

  try {
    const row = await db.query.profiles.findFirst({
      where: sql`lower(${schema.profiles.email}) = lower(${email})`,
    })
    if (!row) {
      console.error(`No profile with email "${email}".`)
      process.exit(1)
    }
    if (row.isAdmin) {
      console.error("Refusing to flip an admin account. Use a non-admin instructor email.")
      process.exit(1)
    }

    console.log(
      `Before: approved=${row.approved} is_active=${row.isActive} id=${row.id}\n` +
        `Setting approved=false, is_active=true (shows in Pending approvals).`
    )

    await db
      .update(schema.profiles)
      .set({
        approved: false,
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(schema.profiles.id, row.id))

    console.log(
      "\nDone. Refresh Pending approvals in the app.\n" +
        `Restore this account with:\n  SEED_PENDING_RESTORE_EMAIL="${email}" npm run db:seed:pending-instructor`
    )
  } finally {
    await pool.end()
  }
}

async function restoreApproved() {
  const databaseUrl = requireEnv("DATABASE_URL")
  const email = requireEnv("SEED_PENDING_RESTORE_EMAIL")
  const pool = new Pool({ connectionString: databaseUrl })
  const db = drizzle(pool, { schema })

  try {
    const row = await db.query.profiles.findFirst({
      where: sql`lower(${schema.profiles.email}) = lower(${email})`,
    })
    if (!row) {
      console.error(`No profile with email "${email}".`)
      process.exit(1)
    }
    if (row.isAdmin) {
      console.error("Refusing to modify an admin account this way.")
      process.exit(1)
    }

    await db
      .update(schema.profiles)
      .set({
        approved: true,
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(schema.profiles.id, row.id))

    console.log(`Restored "${email}" to approved + active.`)
  } finally {
    await pool.end()
  }
}

async function createViaServiceRole() {
  const databaseUrl = requireEnv("DATABASE_URL")
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  const email = process.env.SEED_PENDING_NEW_EMAIL?.trim()
  const password =
    process.env.SEED_PENDING_NEW_PASSWORD?.trim() || "SeedPending1!ChangeMe"

  if (!supabaseUrl || !serviceRole) {
    console.error(
      "Create mode needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.\n" +
        "Use flip mode instead if you only have DATABASE_URL:\n" +
        "  SEED_PENDING_FLIP_EMAIL=you@example.com npm run db:seed:pending-instructor"
    )
    process.exit(1)
  }
  if (!email) {
    console.error(
      "Set SEED_PENDING_NEW_EMAIL to a fresh address (e.g. your Gmail +alias):\n" +
        "  SEED_PENDING_NEW_EMAIL=test.pending+seed1@gmail.com \\\n" +
        "  SEED_PENDING_NEW_PASSWORD='LongPass1!' \\\n" +
        "  npm run db:seed:pending-instructor -- create"
    )
    process.exit(1)
  }

  const admin = createClient(supabaseUrl, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      firstName: "Seed",
      lastName: "Pending",
    },
  })

  if (createErr || !created.user) {
    console.error("auth.admin.createUser failed:", createErr?.message ?? createErr)
    process.exit(1)
  }

  const userId = created.user.id
  const pool = new Pool({ connectionString: databaseUrl })
  const db = drizzle(pool, { schema })

  try {
    const existing = await db.query.profiles.findFirst({
      where: eq(schema.profiles.id, userId),
    })
    if (existing) {
      console.log("Profile row already exists for this user; ensuring pending state.")
      await db
        .update(schema.profiles)
        .set({
          approved: false,
          isActive: true,
          updatedAt: new Date(),
        })
        .where(eq(schema.profiles.id, userId))
    } else {
      await db.insert(schema.profiles).values({
        id: userId,
        firstName: "Seed",
        lastName: "Pending",
        email,
        phone: null,
        notificationPreference: "email",
        approved: false,
        isAdmin: false,
        isActive: true,
      })
    }

    console.log(
      "\nCreated pre-confirmed user + pending profile:\n" +
        `  email:    ${email}\n` +
        `  password: ${password}\n` +
        `  id:       ${userId}\n` +
        "\nThey should appear in Pending approvals. You can sign in as this user to see /pending-approval."
    )
  } finally {
    await pool.end()
  }
}

async function main() {
  if (process.env.SEED_PENDING_RESTORE_EMAIL?.trim()) {
    await restoreApproved()
    return
  }
  if (process.env.SEED_PENDING_FLIP_EMAIL?.trim()) {
    await flipToPending()
    return
  }
  if (wantCreate()) {
    await createViaServiceRole()
    return
  }

  console.log(`
No action. Choose one:

  1) Flip existing instructor to pending (DATABASE_URL only):
       SEED_PENDING_FLIP_EMAIL=their@email.com npm run db:seed:pending-instructor

  2) Restore after testing:
       SEED_PENDING_RESTORE_EMAIL=their@email.com npm run db:seed:pending-instructor

  3) Create new auth user + pending profile (needs service role key in .env):
       SEED_PENDING_NEW_EMAIL=test+pending1@gmail.com \\
       SEED_PENDING_NEW_PASSWORD='YourLongPassword1!' \\
       npm run db:seed:pending-instructor -- create
`)
  process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
