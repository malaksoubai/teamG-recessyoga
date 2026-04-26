"use server"

import { db } from "@/app/db"
import { coverageRequests } from "@/app/db/schema"
import { notifySubRequest } from "@/app/notifications/notify-sub-request"
import { createClient } from "@/app/supabase/server"

export async function createCoverageRequest(formData: {
  studioLocation: string
  date: string
  startTime: string
  endTime: string
  classType: string
  comment: string
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const startAt = new Date(`${formData.date}T${formData.startTime}`)
  const endAt   = new Date(`${formData.date}T${formData.endTime}`)

  // Placeholder until dropdowns pull IDs from DB
  const locationId  = 1
  const classTypeId = 1

  const [newRequest] = await db
    .insert(coverageRequests)
    .values({
      locationId,
      originalClassTypeId: classTypeId,
      currentClassTypeId:  classTypeId,
      startAt,
      endAt,
      requestedByInstructorId: user.id,
      reason: formData.comment || null,
      status: "open",
      classTypeChangeStatus: "none",
    })
    .returning()

  await notifySubRequest(newRequest.id)

  return { success: true }
}