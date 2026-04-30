/**
 * Supabase server client — use this inside Server Components, Route Handlers,
 * and Server Actions. Reads/writes session cookies via next/headers.
 *
 * Must be called inside an async context (Server Component, route handler, etc.)
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import { getSupabasePublishableKey, getSupabaseUrl } from '@/lib/supabase-env';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    getSupabaseUrl(),
    getSupabasePublishableKey(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll is called from a Server Component — middleware handles
            // refreshing the session so this can safely be ignored.
          }
        },
      },
    }
  );
}
