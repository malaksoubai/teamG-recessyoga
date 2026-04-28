/**
 * Primary tRPC API router.
 *
 * Add new routers here as the app grows.
 * The AppRouter type is re-exported so the frontend client stays in sync.
 */

import { createCallerFactory, createTRPCRouter } from './trpc';
import { profilesApiRouter } from './routers/profiles';

export const appRouter = createTRPCRouter({
  profiles: profilesApiRouter,
});

/** Type used by the tRPC client — never import the router itself on the client. */
export type AppRouter = typeof appRouter;

/** Server-side caller (useful for Server Components and server actions). */
export const createCaller = createCallerFactory(appRouter);
