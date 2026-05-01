import "server-only"

import { aliasedTable, and, eq, gt, or } from "drizzle-orm"

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
  /** Present when someone has claimed (or pending approval with a claimer). */
  claimedByDisplayName?: string | null
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

/** Home list: urgent (<24h) first, then <72h, then rest; within each tier, soonest class first. */
function sortRowsForHomeList(
  rows: {
    startAt: Date | null
    urgency: SubstituteRequestCardData["urgency"]
    card: SubstituteRequestCardData
  }[]
) {
  const tier = (u: SubstituteRequestCardData["urgency"]) => {
    if (u?.kind === "urgent") return 0
    if (u?.kind === "within72") return 1
    return 2
  }

  rows.sort((a, b) => {
    const ta = tier(a.urgency)
    const tb = tier(b.urgency)
    if (ta !== tb) return ta - tb
    const aMs = a.startAt ? new Date(a.startAt).getTime() : 0
    const bMs = b.startAt ? new Date(b.startAt).getTime() : 0
    return aMs - bMs
  })
}

/** Drizzle loses select row typing on this join + `or` + `gt` chain (TS `never`). */
type SubstituteRequestHomeRow = {
  id: number
  reason: string | null
  status: string
  classTypeChangeStatus: string
  startAt: Date
  endAt: Date
  requestedByFirstName: string
  requestedByLastName: string
  claimerFirstName: string | null
  claimerLastName: string | null
  locationName: string | null
  originalClassTypeName: string | null
  currentClassTypeName: string | null
}

export async function getOpenSubstituteRequests(): Promise<SubstituteRequestCardData[]> {
  const currentClassType = aliasedTable(schema.classTypes, "current_class_type")
  const originalClassType = aliasedTable(schema.classTypes, "original_class_type")
  const claimerProfile = aliasedTable(schema.profiles, "claimer_profile")

  /** Same as `start_at + interval '60 days' > now()` — hide card after 60 days past class. */
  const hideIfStartBefore = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)

  const rows = (await db
    .select({
      id: schema.coverageRequests.id,
      reason: schema.coverageRequests.reason,
      status: schema.coverageRequests.status,
      classTypeChangeStatus: schema.coverageRequests.classTypeChangeStatus,
      startAt: schema.coverageRequests.startAt,
      endAt: schema.coverageRequests.endAt,
      requestedByFirstName: schema.profiles.firstName,
      requestedByLastName: schema.profiles.lastName,
      claimerFirstName: claimerProfile.firstName,
      claimerLastName: claimerProfile.lastName,
      locationName: schema.locations.name,
      originalClassTypeName: originalClassType.name,
      currentClassTypeName: currentClassType.name,
    })
    .from(schema.coverageRequests)
    .innerJoin(
      schema.profiles,
      eq(schema.coverageRequests.requestedByInstructorId, schema.profiles.id)
    )
    .leftJoin(
      claimerProfile,
      eq(schema.coverageRequests.claimedByInstructorId, claimerProfile.id)
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
    .where(
      and(
        or(
          eq(schema.coverageRequests.status, "open"),
          eq(schema.coverageRequests.status, "pending_approval"),
          eq(schema.coverageRequests.status, "claimed"),
          eq(schema.coverageRequests.status, "approved"),
        ),
        gt(schema.coverageRequests.startAt, hideIfStartBefore),
      )
    )) as SubstituteRequestHomeRow[]

  const withSort = rows.map((row) => {
    const urgency = buildUrgency(row.startAt)
    const classChangeSummary =
      row.originalClassTypeName &&
      row.currentClassTypeName &&
      row.originalClassTypeName !== row.currentClassTypeName
        ? `${row.originalClassTypeName} -> ${row.currentClassTypeName}`
        : undefined

    const claimedByDisplayName =
      row.claimerFirstName || row.claimerLastName
        ? buildRequestedBy(row.claimerFirstName, row.claimerLastName)
        : null

    const card: SubstituteRequestCardData = {
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
      claimedByDisplayName,
    }
    return { startAt: row.startAt, urgency, card }
  })

  sortRowsForHomeList(withSort)
  return withSort.map((x) => x.card)
}
