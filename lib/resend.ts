import { Resend } from "resend"

/**
 * Resend throws if constructed without a key. That must not run at module load,
 * or importing notification helpers breaks the entire tRPC bundle (HTML 500 on /api/trpc).
 */
export function getResendOrNull(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim()
  if (!key) return null
  return new Resend(key)
}
