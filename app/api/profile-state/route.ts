import { NextResponse } from "next/server"

import { createClient } from "@/app/supabase/server"

export const dynamic = "force-dynamic"
import type { CurrentUserStateResponse } from "@/lib/current-user-state"
import { resolveCurrentUserStateForUserId } from "@/lib/resolve-current-user-state"

export async function GET() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const state = await resolveCurrentUserStateForUserId(user.id)
  const body: CurrentUserStateResponse = { state }
  return NextResponse.json(body)
}
