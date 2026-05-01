import { redirect } from "next/navigation"

import { AdminHomeScreen } from "@/components/home/admin-home-screen"

/**
 * Local UI preview only — not linked in the app shell.
 * Middleware allows this path without a session when NODE_ENV !== "production".
 */
export default function AdminHomePreviewPage() {
  if (process.env.NODE_ENV === "production") {
    redirect("/")
  }

  return <AdminHomeScreen />
}
