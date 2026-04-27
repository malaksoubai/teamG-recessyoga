import Link from "next/link"
import { redirect } from "next/navigation"

import { createClient } from "@/app/supabase/server"

export const dynamic = "force-dynamic"
import { redirectPathForCurrentUserState } from "@/lib/post-login-redirect"
import { resolveCurrentUserStateForUserId } from "@/lib/resolve-current-user-state"

export default async function CompleteProfilePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const state = await resolveCurrentUserStateForUserId(user.id)
  if (state !== "no_profile") {
    redirect(redirectPathForCurrentUserState(state))
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#eef1ec] px-4 text-center text-[#1b1b1b]">
      <h1 className="text-2xl font-semibold text-[#78806f]">Finish setting up</h1>
      <p className="mt-3 max-w-md text-sm text-[#6b6b6b]">
        You are signed in, but we do not have a studio profile linked to this account yet.
        Complete sign up or contact your studio admin if this keeps happening.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/sign-up"
          className="inline-flex rounded-xl bg-[#1e461f] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          Go to sign up
        </Link>
        <Link
          href="/logout"
          className="inline-flex rounded-xl border border-[#d8dcd5] bg-white px-5 py-2.5 text-sm font-semibold text-[#1b1b1b] hover:bg-[#f1f5f0]"
        >
          Sign out
        </Link>
      </div>
    </div>
  )
}
