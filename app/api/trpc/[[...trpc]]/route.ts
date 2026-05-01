/**
 * Next.js App Router route handler for tRPC.
 *
 * Uses optional catch-all `[[...trpc]]` so both `/api/trpc` (batch POST)
 * and `/api/trpc/...` resolve here. A single `[trpc]` segment would NOT
 * match `/api/trpc` alone, which returned HTML 404 and broke JSON parsing.
 */

import { fetchRequestHandler } from "@trpc/server/adapters/fetch"

import { appRouter } from "@/app/server/api/root"
import { createTRPCContext } from "@/app/server/api/trpc"

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: (opts) => createTRPCContext(opts),
    onError:
      process.env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `tRPC error on /${path ?? "<no-path>"}:`,
              error.message,
            )
          }
        : undefined,
  })

export { handler as GET, handler as POST }
