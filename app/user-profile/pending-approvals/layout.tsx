import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { db } from "@/app/server/db"
import { profiles } from "@/app/db/schema"
import { eq } from "drizzle-orm"

export const dynamic = "force-dynamic"

export default async function PendingApprovalsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const row = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
    columns: { isAdmin: true },
  })
  if (!row?.isAdmin) {
    redirect("/user-profile/profile-details")
  }

  return children
}
