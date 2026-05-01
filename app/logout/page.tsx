"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { createClient } from "@/lib/supabase/client"
import { getQueryClient } from "@/lib/trpc/provider"

export default function LogoutPage() {
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const supabase = createClient()
        await supabase.auth.signOut()
        getQueryClient().clear()
      } catch {
        // Still show signed-out UI; session may already be cleared
      } finally {
        if (!cancelled) {
          setSigningOut(false)
          router.refresh()
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#ffffff] px-4 text-center text-[#1b1b1b]">
      <h1 className="text-2xl font-bold">
        {signingOut ? "Signing out…" : "Signed out"}
      </h1>
      <p className="mt-2 max-w-sm text-sm text-[#6b6b6b]">
        {signingOut
          ? "Clearing your session."
          : "You have been logged out of Recess Yoga Studio."}
      </p>
      <Link
        href="/login"
        className="mt-8 inline-flex rounded-xl bg-[#1e461f] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
      >
        Sign In
      </Link>
    </div>
  )
}
