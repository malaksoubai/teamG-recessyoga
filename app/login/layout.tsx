import { redirect } from "next/navigation"

import { createClient } from "@/app/supabase/server"
import { redirectPathForCurrentUserState } from "@/lib/post-login-redirect"
import { resolveCurrentUserStateForUserId } from "@/lib/resolve-current-user-state"

export const dynamic = "force-dynamic"

export default async function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) {
    const state = await resolveCurrentUserStateForUserId(user.id)
    redirect(redirectPathForCurrentUserState(state))
  }
  return children
}
