/**
 * Supabase browser client — use this inside Client Components ("use client").
 * Creates a new client on every call; safe to call from multiple components
 * because @supabase/ssr reuses the underlying session from cookies.
 */

import { createBrowserClient } from '@supabase/ssr';

import { getSupabasePublishableKey, getSupabaseUrl } from '@/lib/supabase-env';

export function createClient() {
  return createBrowserClient(getSupabaseUrl(), getSupabasePublishableKey());
}
