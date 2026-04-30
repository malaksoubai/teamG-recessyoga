import "server-only"

import { aliasedTable, desc, eq, inArray } from "drizzle-orm"

import { db, schema } from "@/app/server/db"

export type UrgencyKind = "urgent" | "within72"

/** Matches `ClaimSubstituteModal` / `notify-sub-request` buckets. */
export type ClaimModalUrgency = "less-than-24h" | "within-72h" | "within-week" | "over-week"

export type SubstituteRequestCardData = {
  id: string
  title: string
  requestedBy: string
  /** Single line for the home card (start time). */
  dateTime: string
  location: string
  borderTop: "urgent" | "standard"
  urgency?: {
    kind: UrgencyKind
    label: string
  }
  note?: string
  needsApproval?: boolean
  classChangeSummary?: string
  /** For claim modal — derived from `startAt` in the same way as notification urgency. */
  claimModalUrgency: ClaimModalUrgency
  /** Short date line for the claim modal. */
  modalCalendarDate: string
  /** Start–end time for the claim modal. */
  modalTimeRange: string
  /** Raw DB status — used to initialise the card's button state. */
  dbStatus: string
}

function formatDateTime(dateValue: Date | string | null): string {
  if (!dateValue) {
    return "Date TBD"
  }

  const date = typeof dateValue === "string" ? new Date(dateValue) : dateValue
  if (Number.isNaN(date.getTime())) {
    return "Date TBD"
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

function formatCalendarDate(dateValue: Date | string | null): string {
  if (!dateValue) return "Date TBD"
  const date = typeof dateValue === "string" ? new Date(dateValue) : dateValue
  if (Number.isNaN(date.getTime())) return "Date TBD"
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date)
}

function formatTimeRange(
  startValue: Date | string | null,
  endValue: Date | string | null
): string {
  if (!startValue) return "Time TBD"
  const start = typeof startValue === "string" ? new Date(startValue) : startValue
  if (Number.isNaN(start.getTime())) return "Time TBD"
  const timeFmt = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" })
  if (!endValue) return timeFmt.format(start)
  const end = typeof endValue === "string" ? new Date(endValue) : endValue
  if (Number.isNaN(end.getTime())) return timeFmt.format(start)
  return `${timeFmt.format(start)} – ${timeFmt.format(end)}`
}

function buildRequestedBy(firstName: string | null, lastName: string | null): string {
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim()
  return fullName || "Instructor"
}

function buildUrgency(startAt: Date | string | null): SubstituteRequestCardData["urgency"] {
  if (!startAt) {
    return undefined
  }

  const startDate = typeof startAt === "string" ? new Date(startAt) : startAt
  const diffMs = startDate.getTime() - Date.now()

  if (!Number.isFinite(diffMs) || diffMs < 0) {
    return undefined
  }

  const diffHours = diffMs / (1000 * 60 * 60)

  if (diffHours <= 24) {
    return { kind: "urgent", label: "URGENT - Less than 24 hours" }
  }

  if (diffHours <= 72) {
    return { kind: "within72", label: "Within 72 hours" }
  }

  return undefined
}

function buildClaimModalUrgency(startAt: Date | string | null): ClaimModalUrgency {
  if (!startAt) return "over-week"
  const startDate = typeof startAt === "string" ? new Date(startAt) : startAt
  const diffMs = startDate.getTime() - Date.now()
  if (!Number.isFinite(diffMs)) return "over-week"
  const hoursUntil = diffMs / (1000 * 60 * 60)
  if (hoursUntil < 0) return "over-week"
  if (hoursUntil < 24) return "less-than-24h"
  if (hoursUntil < 72) return "within-72h"
  if (hoursUntil < 168) return "within-week"
  return "over-week"
}

export async function getOpenSubstituteRequests(): Promise<SubstituteRequestCardData[]> {
  const currentClassType = aliasedTable(schema.classTypes, "current_class_type")
  const originalClassType = aliasedTable(schema.classTypes, "original_class_type")

  const rows = await db
    .select({
      id: schema.coverageRequests.id,
      reason: schema.coverageRequests.reason,
      status: schema.coverageRequests.status,
      classTypeChangeStatus: schema.coverageRequests.classTypeChangeStatus,
      startAt: schema.coverageRequests.startAt,
      endAt: schema.coverageRequests.endAt,
      requestedByFirstName: schema.profiles.firstName,
      requestedByLastName: schema.profiles.lastName,
      locationName: schema.locations.name,
      originalClassTypeName: originalClassType.name,
      currentClassTypeName: currentClassType.name,
    })
    .from(schema.coverageRequests)
    .innerJoin(
      schema.profiles,
      eq(schema.coverageRequests.requestedByInstructorId, schema.profiles.id)
    )
    .innerJoin(schema.locations, eq(schema.coverageRequests.locationId, schema.locations.id))
    .innerJoin(
      currentClassType,
      eq(schema.coverageRequests.currentClassTypeId, currentClassType.id)
    )
    .innerJoin(
      originalClassType,
      eq(schema.coverageRequests.originalClassTypeId, originalClassType.id)
    )
    .where(inArray(schema.coverageRequests.status, ["open", "pending_approval"]))
    .orderBy(desc(schema.coverageRequests.startAt))

  return rows.map((row) => {
    const urgency = buildUrgency(row.startAt)
    const classChangeSummary =
      row.originalClassTypeName &&
      row.currentClassTypeName &&
      row.originalClassTypeName !== row.currentClassTypeName
        ? `${row.originalClassTypeName} -> ${row.currentClassTypeName}`
        : undefined

    return {
      id: String(row.id),
      title: row.currentClassTypeName || "Class",
      requestedBy: buildRequestedBy(row.requestedByFirstName, row.requestedByLastName),
      dateTime: formatDateTime(row.startAt),
      location: row.locationName || "Location TBD",
      borderTop: urgency?.kind === "urgent" ? "urgent" : "standard",
      urgency,
      note: row.reason || undefined,
      needsApproval:
        row.status === "pending_approval" || row.classTypeChangeStatus === "pending",
      classChangeSummary,
      claimModalUrgency: buildClaimModalUrgency(row.startAt),
      modalCalendarDate: formatCalendarDate(row.startAt),
      modalTimeRange: formatTimeRange(row.startAt, row.endAt),
      dbStatus: row.status,
    }
  })
}
