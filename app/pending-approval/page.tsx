import Link from "next/link"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"
import { redirectPathForCurrentUserState } from "@/lib/post-login-redirect"
import { resolveCurrentUserStateForUserId } from "@/lib/resolve-current-user-state"

export default async function PendingApprovalPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const state = await resolveCurrentUserStateForUserId(user.id)
  if (state !== "pending") {
    redirect(redirectPathForCurrentUserState(state))
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#eef1ec] px-4 text-center text-[#1b1b1b]">
      <h1 className="text-2xl font-semibold text-[#78806f]">Account pending</h1>
      <p className="mt-3 max-w-md text-sm text-[#6b6b6b]">
        Your profile is not approved yet. You will get access once an administrator
        approves your account.
      </p>
      <Link
        href="/logout"
        className="mt-8 text-sm font-medium text-[#1e461f] underline underline-offset-2"
      >
        Sign out
      </Link>
    </div>
  )
}
