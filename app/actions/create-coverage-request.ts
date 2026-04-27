"use server"

import { eq } from "drizzle-orm"

import { db } from "@/app/server/db"
import {
  classTypes,
  coverageRequests,
  locations,
} from "@/app/db/schema"
import { notifySubRequest } from "@/app/notifications/notify-sub-request"
import { createClient } from "@/lib/supabase/server"

export type CreateCoverageRequestResult =
  | { ok: true }
  | { ok: false; message: string }

export async function createCoverageRequest(formData: {
  studioLocation: string
  date: string
  startTime: string
  endTime: string
  classType: string
  comment: string
}): Promise<CreateCoverageRequestResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, message: "You must be signed in to request coverage." }
  }

  const startAt = new Date(`${formData.date}T${formData.startTime}`)
  const endAt = new Date(`${formData.date}T${formData.endTime}`)

  const location = await db.query.locations.findFirst({
    where: eq(locations.name, formData.studioLocation),
  })
  if (!location) {
    return {
      ok: false,
      message: `Studio "${formData.studioLocation}" is not in the database. Run supabase/migrations/003_seed_locations.sql in the SQL Editor, then try again.`,
    }
  }

  const classType = await db.query.classTypes.findFirst({
    where: eq(classTypes.name, formData.classType),
  })
  if (!classType) {
    return {
      ok: false,
      message: `Class type "${formData.classType}" is not in the database. Run supabase/migrations/002_seed_class_types.sql or pick a class type that exists in class_types.`,
    }
  }

  let newRequest
  try {
    const [row] = await db
      .insert(coverageRequests)
      .values({
        locationId: location.id,
        originalClassTypeId: classType.id,
        currentClassTypeId: classType.id,
        startAt,
        endAt,
        requestedByInstructorId: user.id,
        reason: formData.comment || null,
        status: "open",
        classTypeChangeStatus: "none",
      })
      .returning()
    newRequest = row
  } catch (e) {
    console.error("createCoverageRequest insert failed:", e)
    return {
      ok: false,
      message:
        e instanceof Error
          ? e.message
          : "Could not save the coverage request (database error).",
    }
  }

  if (!newRequest) {
    return { ok: false, message: "Insert did not return a row." }
  }

  try {
    await notifySubRequest(newRequest.id)
  } catch (e) {
    console.error("notifySubRequest failed (request was saved):", e)
  }

  return { ok: true }
}
