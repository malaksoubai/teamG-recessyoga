import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"
import { TeacherHomeScreen } from "@/components/home/teacher-home-screen"
import { redirectPathForCurrentUserState } from "@/lib/post-login-redirect"
import { resolveCurrentUserStateForUserId } from "@/lib/resolve-current-user-state"

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const state = await resolveCurrentUserStateForUserId(user.id)
  const target = redirectPathForCurrentUserState(state)
  if (target !== "/") redirect(target)

  return <TeacherHomeScreen />
}
