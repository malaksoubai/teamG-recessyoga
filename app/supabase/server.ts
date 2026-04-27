import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase-env"

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    getSupabaseUrl(),
    getSupabasePublishableKey(),
    {
      cookies: {
        async getAll() {
          return (await cookieStore).getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(async ({ name, value, options }) =>
            (await cookieStore).set(name, value, options)
          )
        },
      },
    }
  )
}