"use server"

import { createClient } from "@/lib/supabase/server"
import { ensureProfileForAuthUser } from "@/lib/ensure-profile-from-auth-user"

export async function syncAuthProfile(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return { ok: false, error: error?.message ?? "Not signed in" }
  }

  try {
    await ensureProfileForAuthUser(user)
    return { ok: true }
  } catch (e: unknown) {
    console.error("syncAuthProfile:", e)
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not save studio profile",
    }
  }
}
