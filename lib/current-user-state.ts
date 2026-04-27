/**
 * Matches backend contract: api.profiles.getCurrentUserState (tRPC) — call only when a Supabase session exists.
 */
export type CurrentUserState =
  | "no_profile"
  | "pending"
  | "approved"
  | "admin"

export type CurrentUserStateResponse = {
  state: CurrentUserState
}
