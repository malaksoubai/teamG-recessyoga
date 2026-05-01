"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type { EmailOtpType } from "@supabase/supabase-js"

import { syncAuthProfile } from "@/app/actions/sync-auth-profile"
import { createClient } from "@/lib/supabase/client"

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      const supabase = createClient()
      const code = searchParams.get("code")
      const token_hash = searchParams.get("token_hash")
      const type = searchParams.get("type") as EmailOtpType | null

      let sessionError: string | null = null

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) sessionError = error.message
      } else if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash, type })
        if (error) sessionError = error.message
      } else if (typeof window !== "undefined" && window.location.hash) {
        const params = new URLSearchParams(
          window.location.hash.replace(/^#/, ""),
        )
        const access_token = params.get("access_token")
        const refresh_token = params.get("refresh_token")
        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          })
          if (error) sessionError = error.message
        } else {
          sessionError = "No session in URL fragment"
        }
      } else {
        sessionError = "Missing confirmation link parameters"
      }

      if (cancelled) return
      if (sessionError) {
        router.replace(`/sign-up?error=${encodeURIComponent(sessionError)}`)
        return
      }

      const sync = await syncAuthProfile()
      if (cancelled) return
      if (!sync.ok) {
        router.replace(
          `/sign-up?error=${encodeURIComponent(sync.error ?? "profile_sync")}`,
        )
        return
      }

      if (typeof window !== "undefined" && window.location.hash) {
        window.history.replaceState(null, "", window.location.pathname + window.location.search)
      }

      router.replace("/pending-approval")
    })()

    return () => {
      cancelled = true
    }
  }, [router, searchParams])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#eef1ec] px-4 text-center text-[#4a5149]">
      <p className="text-sm">Confirming your account…</p>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#eef1ec] px-4 text-center text-[#4a5149]">
          <p className="text-sm">Loading…</p>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  )
}
