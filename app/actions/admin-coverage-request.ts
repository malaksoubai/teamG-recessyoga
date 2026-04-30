"use server"

import { revalidatePath } from "next/cache"
import { and, eq } from "drizzle-orm"

import { db } from "@/app/server/db"
import { coverageRequests, profiles } from "@/app/db/schema"
import { createClient } from "@/lib/supabase/server"

async function requireAdminProfile() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
  })
  if (!profile?.isAdmin) throw new Error("Not authorized")
}

export async function approveClassTypeChange(requestId: number) {
  await requireAdminProfile()

  await db
    .update(coverageRequests)
    .set({
      classTypeChangeStatus: "approved",
      status: "open",
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(coverageRequests.id, requestId),
        eq(coverageRequests.classTypeChangeStatus, "pending"),
      ),
    )

  revalidatePath("/admin")
  return { success: true as const }
}

export async function denyClassTypeChange(requestId: number) {
  await requireAdminProfile()

  const row = await db.query.coverageRequests.findFirst({
    where: eq(coverageRequests.id, requestId),
  })
  if (!row) throw new Error("Request not found")

  await db
    .update(coverageRequests)
    .set({
      classTypeChangeStatus: "rejected",
      currentClassTypeId: row.originalClassTypeId,
      status: "open",
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(coverageRequests.id, requestId),
        eq(coverageRequests.classTypeChangeStatus, "pending"),
      ),
    )

  revalidatePath("/admin")
  return { success: true as const }
}
