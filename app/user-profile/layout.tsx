import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { UserProfileGateProvider } from "@/components/user-profile/user-profile-gate-provider"
import { redirectPathForCurrentUserState } from "@/lib/post-login-redirect"
import { resolveCurrentUserStateForUserId } from "@/lib/resolve-current-user-state"

export const dynamic = "force-dynamic"

export default async function UserProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const state = await resolveCurrentUserStateForUserId(user.id)
  if (state !== "approved" && state !== "admin") {
    redirect(redirectPathForCurrentUserState(state))
  }

  const isAdmin = state === "admin"

  return <UserProfileGateProvider isAdmin={isAdmin}>{children}</UserProfileGateProvider>
}
