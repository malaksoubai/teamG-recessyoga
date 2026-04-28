/**
 * tRPC React client.
 *
 * Import `trpc` in any Client Component to get fully type-safe hooks:
 *
 *   const { data } = trpc.profiles.getCurrentProfile.useQuery();
 *   const mutation = trpc.profiles.createProfile.useMutation();
 */

import { createTRPCReact } from '@trpc/react-query';
import { type AppRouter } from '@/app/server/api/root';

export const trpc = createTRPCReact<AppRouter>();
