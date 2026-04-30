/**
 * Next.js middleware — runs on every request before the page renders.
 *
 * Two jobs:
 *  1. Refresh the Supabase session (keeps the access token alive).
 *  2. Protect routes: unauthenticated users are redirected to /login.
 */

import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase-env"

const PUBLIC_ROUTES = [
  "/login",
  "/sign-up",
  "/pending-approval",
  "/account-rejected",
  "/auth/callback",
  "/logout",
  "/complete-profile",
  ...(process.env.NODE_ENV !== "production" ? ["/dev/admin-home-preview"] : []),
]

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  let url: string
  let key: string
  try {
    url = getSupabaseUrl()
    key = getSupabasePublishableKey()
  } catch {
    return supabaseResponse
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route))
  const isApiRoute = pathname.startsWith("/api/")

  if (!user && !isPublic && !isApiRoute) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/login"
    return NextResponse.redirect(loginUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)",
  ],
}
