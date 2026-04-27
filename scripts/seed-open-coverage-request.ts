/**
 * Inserts one open `coverage_requests` row for local / QA testing (home cards, API).
 * Uses DATABASE_URL (direct Postgres) — no Supabase SQL Editor access required.
 *
 * Usage:
 *   SEED_INSTRUCTOR_EMAIL=you@example.com npm run db:seed:test-sub
 *
 * Optional env:
 *   SEED_CLASS_TYPE_NAME   (default: Vinyasa — must exist or first row is used)
 *   SEED_LOCATION_NAME     (default: Dev Seed Studio — created if missing)
 */

import { config } from "dotenv"

config({ path: ".env.local" })
config({ path: ".env" })

import { drizzle } from "drizzle-orm/node-postgres"
import { eq, sql } from "drizzle-orm"
import { Pool } from "pg"

import * as schema from "@/app/db/schema"

function requireEnv(name: string): string {
  const v = process.env[name]?.trim()
  if (!v) {
    console.error(`Missing ${name}. Set it in .env / .env.local or pass in the shell.`)
    process.exit(1)
  }
  return v
}

async function main() {
  const databaseUrl = requireEnv("DATABASE_URL")
  const email =
    process.env.SEED_INSTRUCTOR_EMAIL?.trim() ||
    process.argv.find((a) => a.includes("@"))?.trim()

  if (!email) {
    console.error(
      "Set SEED_INSTRUCTOR_EMAIL to an existing profile email, e.g.\n" +
        "  SEED_INSTRUCTOR_EMAIL=you@studio.com npm run db:seed:test-sub"
    )
    process.exit(1)
  }

  const locationName = process.env.SEED_LOCATION_NAME?.trim() || "Dev Seed Studio"
  const classTypeName = process.env.SEED_CLASS_TYPE_NAME?.trim() || "Vinyasa"

  const pool = new Pool({ connectionString: databaseUrl })
  const db = drizzle(pool, { schema })

  try {
    const profile = await db.query.profiles.findFirst({
      where: sql`lower(${schema.profiles.email}) = lower(${email})`,
    })
    if (!profile) {
      console.error(`No profile with email "${email}". Sign up / approve first, then re-run.`)
      process.exit(1)
    }

    let location = await db.query.locations.findFirst({
      where: eq(schema.locations.name, locationName),
    })
    if (!location) {
      await db.insert(schema.locations).values({ name: locationName })
      location = await db.query.locations.findFirst({
        where: eq(schema.locations.name, locationName),
      })
    }
    if (!location) {
      console.error("Failed to resolve location after insert.")
      process.exit(1)
    }

    let classType = await db.query.classTypes.findFirst({
      where: eq(schema.classTypes.name, classTypeName),
    })
    if (!classType) {
      classType = await db.query.classTypes.findFirst()
    }
    if (!classType) {
      const [created] = await db
        .insert(schema.classTypes)
        .values({ name: classTypeName })
        .returning()
      classType = created
    }
    if (!classType) {
      console.error("Could not resolve or create a class type row.")
      process.exit(1)
    }

    const startAt = new Date()
    startAt.setDate(startAt.getDate() + 3)
    startAt.setHours(10, 0, 0, 0)
    const endAt = new Date(startAt)
    endAt.setHours(11, 0, 0, 0)

    const [row] = await db
      .insert(schema.coverageRequests)
      .values({
        locationId: location.id,
        originalClassTypeId: classType.id,
        currentClassTypeId: classType.id,
        startAt,
        endAt,
        requestedByInstructorId: profile.id,
        reason: "Seed row from scripts/seed-open-coverage-request.ts",
        status: "open",
        classTypeChangeStatus: "none",
      })
      .returning({ id: schema.coverageRequests.id })

    console.log(
      `Inserted coverage_requests id=${row.id} for ${email} (${locationName}, ${classType.name}).\n` +
        "Reload the instructor home or GET /api/substitute-requests to verify."
    )
  } finally {
    await pool.end()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
