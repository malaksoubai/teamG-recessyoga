/**
 * Supabase browser client — use this inside Client Components ("use client").
 * Creates a new client on every call; safe to call from multiple components
 * because @supabase/ssr reuses the underlying session from cookies.
 */

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
