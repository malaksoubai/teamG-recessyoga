import Link from "next/link"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"
import { redirectPathForCurrentUserState } from "@/lib/post-login-redirect"
import { resolveCurrentUserStateForUserId } from "@/lib/resolve-current-user-state"

export default async function AccountRejectedPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const state = await resolveCurrentUserStateForUserId(user.id)
  if (state !== "rejected") {
    redirect(redirectPathForCurrentUserState(state))
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#eef1ec] px-4 text-center text-[#1b1b1b]">
      <h1 className="text-2xl font-semibold text-[#78806f]">Account not approved</h1>
      <p className="mt-3 max-w-md text-sm text-[#6b6b6b]">
        Your application was not approved, so this studio account does not have access
        to the instructor app. If you think this is a mistake, contact the studio.
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
