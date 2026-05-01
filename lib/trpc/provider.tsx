'use client';

/**
 * TRPCReactProvider
 *
 * Wrap the app (in layout.tsx) with this provider to enable tRPC hooks
 * in all Client Components.
 *
 * Usage in layout.tsx:
 *   import { TRPCReactProvider } from '@/lib/trpc/provider';
 *   <TRPCReactProvider>{children}</TRPCReactProvider>
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink, loggerLink } from '@trpc/client';
import { useState } from 'react';
import superjson from 'superjson';
import { trpc } from './client';

function getBaseUrl() {
  if (typeof window !== 'undefined') return ''; // browser → relative URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 60 seconds — avoids redundant refetches
        // when navigating between pages.
        staleTime: 60 * 1000,
      },
    },
  });
}

// Keep a singleton QueryClient in the browser so React Query state is shared
// across re-renders and navigations.
let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new client (no sharing between requests).
    return makeQueryClient();
  }
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

export function TRPCReactProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === 'development' ||
            (opts.direction === 'down' && opts.result instanceof Error),
        }),
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          transformer: superjson,
          // Forward credentials (cookies) so the server tRPC context can
          // read the Supabase session and authenticate the user.
          fetch: (url, options) =>
            fetch(url, { ...options, credentials: 'include' }),
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
