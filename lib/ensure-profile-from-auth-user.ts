import { eq } from "drizzle-orm"
import type { User } from "@supabase/supabase-js"

import { db } from "@/app/server/db"
import {
  profiles,
  classTypes,
  instructorQualifications,
} from "@/app/db/schema"

type SignUpMetadata = {
  firstName?: string
  lastName?: string
  phone?: string
  notificationPreference?: "email" | "sms"
  selectedClassTypeNames?: string[]
}

/**
 * Idempotent: creates `profiles` (+ qualifications) from Supabase Auth user_metadata
 * after email confirmation, if no row exists yet.
 */
export async function ensureProfileForAuthUser(user: User) {
  const existing = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
  })
  if (existing) return

  const metadata = user.user_metadata as SignUpMetadata

  await db.insert(profiles).values({
    id: user.id,
    firstName: metadata.firstName ?? "",
    lastName: metadata.lastName ?? "",
    email: user.email ?? "",
    phone: metadata.phone ?? null,
    notificationPreference: metadata.notificationPreference ?? "email",
    approved: false,
    isAdmin: false,
    isActive: true,
  })

  const selectedClassTypeNames = metadata.selectedClassTypeNames ?? []
  if (selectedClassTypeNames.length === 0) return

  const classTypeRows = await db.query.classTypes.findMany()
  const nameToId = new Map(
    classTypeRows.map((ct) => [ct.name.toLowerCase(), ct.id]),
  )

  const qualifications = selectedClassTypeNames
    .map((name) => nameToId.get(name.toLowerCase()))
    .filter((id): id is number => id !== undefined)
    .map((classTypeId) => ({ instructorId: user.id, classTypeId }))

  if (qualifications.length === 0) return

  await db
    .insert(instructorQualifications)
    .values(qualifications)
    .onConflictDoNothing()
}
