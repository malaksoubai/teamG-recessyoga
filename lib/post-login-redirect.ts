import type { CurrentUserState } from "@/lib/current-user-state"

/** Default app path after login for each `getCurrentUserState`-style value. */
export function redirectPathForCurrentUserState(state: CurrentUserState): string {
  switch (state) {
    case "admin":
      return "/admin"
    case "approved":
      return "/"
    case "pending":
      return "/pending-approval"
    case "rejected":
      return "/account-rejected"
    case "no_profile":
      return "/complete-profile"
  }
}
