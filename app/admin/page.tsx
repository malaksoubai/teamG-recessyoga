import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"
import { AdminHomeScreen } from "@/components/home/admin-home-screen"
import { redirectPathForCurrentUserState } from "@/lib/post-login-redirect"
import { resolveCurrentUserStateForUserId } from "@/lib/resolve-current-user-state"

export default async function AdminHomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const state = await resolveCurrentUserStateForUserId(user.id)
  if (state !== "admin") {
    redirect(redirectPathForCurrentUserState(state))
  }

  return <AdminHomeScreen />
}
