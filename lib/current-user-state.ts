/**
 * High-level gate for server layouts/pages (same rules as `profiles.getCurrentProfile` + DB row).
 * Use only when a Supabase session already exists.
 */
export type CurrentUserState =
  | "no_profile"
  | "pending"
  | "approved"
  | "admin"
  /** Profile exists but account is inactive (e.g. application denied). */
  | "rejected"

export type CurrentUserStateResponse = {
  state: CurrentUserState
}
