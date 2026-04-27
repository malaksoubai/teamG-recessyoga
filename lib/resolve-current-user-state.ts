import { eq } from "drizzle-orm"

import { db } from "@/app/db"
import { profiles } from "@/app/db/schema"
import type { CurrentUserState } from "@/lib/current-user-state"

export type ProfileGateRow = {
  isAdmin: boolean
  approved: boolean
  isActive: boolean
}

/** Pure mapping — same rules as DB-backed resolver (for tests / clarity). */
export function currentUserStateFromProfileRow(
  row: ProfileGateRow | null | undefined
): CurrentUserState {
  if (!row) return "no_profile"
  if (!row.isActive) return "pending"
  if (row.isAdmin) return "admin"
  if (row.approved) return "approved"
  return "pending"
}

export async function resolveCurrentUserStateForUserId(
  userId: string
): Promise<CurrentUserState> {
  const [row] = await db
    .select({
      isAdmin: profiles.isAdmin,
      approved: profiles.approved,
      isActive: profiles.isActive,
    })
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1)

  return currentUserStateFromProfileRow(row)
}
