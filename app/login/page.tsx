"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { createClient } from "@/app/supabase/client"
import type { CurrentUserState } from "@/lib/current-user-state"
import { redirectPathForCurrentUserState } from "@/lib/post-login-redirect"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = email.length > 0 && password.length > 0 && !loading

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (signInError) {
        setError(signInError.message)
        return
      }

      const profileRes = await fetch("/api/profile-state", {
        credentials: "include",
        cache: "no-store",
      })
      if (!profileRes.ok) {
        setError(
          profileRes.status === 401
            ? "Signed in but session was not recognized. Try again."
            : "Could not load your account status. Try again."
        )
        return
      }
      const body = (await profileRes.json()) as { state?: CurrentUserState }
      const state = body.state
      if (
        state !== "admin" &&
        state !== "approved" &&
        state !== "pending" &&
        state !== "no_profile"
      ) {
        setError("Unexpected account status from server.")
        return
      }

      router.refresh()
      router.push(redirectPathForCurrentUserState(state))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="h-screen overflow-hidden bg-[#eef1ec] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto flex h-full w-full max-w-3xl items-center justify-center">
        <div className="w-full rounded-[28px] bg-[#eef1ec] px-3 py-4 sm:px-6 sm:py-6">
          <div className="mb-6 text-center sm:mb-8">
            <h1 className="text-3xl font-light text-[#78806f] sm:text-4xl">
              Welcome Back
            </h1>
            <p className="mt-2 text-xs text-[#7d837a] sm:text-sm">
              Sign in to your account
            </p>
          </div>

          <Card className="mx-auto mt-6 w-full max-w-md rounded-[24px] border-0 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.10)] sm:mt-8">
            <CardContent className="p-6 sm:p-8 space-y-5">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label
                    htmlFor="login-email"
                    className="mb-2 block text-sm font-medium text-[#4b5049]"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder="j@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 border-[#d9ddd7]"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="login-password"
                    className="mb-2 block text-sm font-medium text-[#4b5049]"
                  >
                    Password
                  </Label>
                  <Input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 border-[#d9ddd7]"
                  />
                </div>

                {error ? (
                  <p className="text-sm text-red-600" role="alert">
                    {error}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  disabled={!canSubmit}
                  className="h-12 w-full rounded-xl bg-black text-white hover:opacity-90"
                >
                  {loading ? "Signing in…" : "Sign In"}
                </Button>
              </form>

              <p className="text-center text-sm text-[#7d837a]">
                Don’t have an account?{" "}
                <Link href="/sign-up">
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto p-0 font-medium text-[#4d5c49] underline underline-offset-2"
                  >
                    Sign up
                  </Button>
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
