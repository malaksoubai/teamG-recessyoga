/**
 * tRPC context + procedure stems.
 *
 * Three procedure types:
 *  - publicProcedure   – no auth required
 *  - protectedProcedure – user must be signed in (throws UNAUTHORIZED otherwise)
 *  - adminProcedure    – user must be signed in AND have is_admin = true
 *
 * The `subject` in context is just { id: string } matching Supabase's auth.uid().
 * Routers import db directly; it is not threaded through context.
 */

import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/app/server/db';
import { profiles } from '@/app/db/schema';
import { eq } from 'drizzle-orm';

//  Subject type 

export type Subject = {
  id: string; // = auth.uid()
};

//  Context 

interface CreateContextOptions {
  subject: Subject | null;
}

const createInnerTRPCContext = ({ subject }: CreateContextOptions) => ({
  subject,
});

/**
 * Creates the tRPC context for each request.
 * Called from the App Router route handler (app/api/trpc/[trpc]/route.ts).
 * Uses next/headers cookies via the server Supabase client.
 */
export const createTRPCContext = async (_opts: { req: Request }) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return createInnerTRPCContext({
    subject: user ? { id: user.id } : null,
  });
};

//  tRPC initialization 

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        // Surface Zod validation errors to the client for display in forms.
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;

//  Timing middleware (dev latency sim) 

const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    // Simulate real network latency in dev to catch waterfall bugs early.
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();
  console.log(`[TRPC] ${path} took ${Date.now() - start}ms`);
  return result;
});

// = Procedures 

/** No auth required. */
export const publicProcedure = t.procedure.use(timingMiddleware);

/** Requires a signed-in user. Throws UNAUTHORIZED if no session. */
export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.subject) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    return next({
      ctx: {
        // TypeScript now knows subject is non-null in all protected handlers.
        subject: ctx.subject,
      },
    });
  });

/**
 * Requires a signed-in user whose profile has is_admin = true.
 * Throws UNAUTHORIZED if no session, FORBIDDEN if not an admin.
 */
export const adminProcedure = t.procedure
  .use(timingMiddleware)
  .use(async ({ ctx, next }) => {
    if (!ctx.subject) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.id, ctx.subject.id),
    });

    if (!profile?.isAdmin) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Admin access required.',
      });
    }

    return next({
      ctx: {
        subject: ctx.subject,
      },
    });
  });
