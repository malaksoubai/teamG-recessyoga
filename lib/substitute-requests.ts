import "server-only";

import { aliasedTable, desc, eq, inArray } from "drizzle-orm";
import { db, schema } from "@/app/db";

export type UrgencyKind = "urgent" | "within72";

export type SubstituteRequestCardData = {
  id: string;
  title: string;
  requestedBy: string;
  dateTime: string;
  location: string;
  borderTop: "urgent" | "standard";
  urgency?: {
    kind: UrgencyKind;
    label: string;
  };
  note?: string;
  needsApproval?: boolean;
  classChangeSummary?: string;
};

function formatDateTime(dateValue: Date | string | null): string {
  if (!dateValue) {
    return "Date TBD";
  }

  const date = typeof dateValue === "string" ? new Date(dateValue) : dateValue;
  if (Number.isNaN(date.getTime())) {
    return "Date TBD";
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function buildRequestedBy(firstName: string | null, lastName: string | null): string {
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
  return fullName || "Instructor";
}

function buildUrgency(startAt: Date | string | null): SubstituteRequestCardData["urgency"] {
  if (!startAt) {
    return undefined;
  }

  const startDate = typeof startAt === "string" ? new Date(startAt) : startAt;
  const diffMs = startDate.getTime() - Date.now();

  if (!Number.isFinite(diffMs) || diffMs < 0) {
    return undefined;
  }

  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours <= 24) {
    return { kind: "urgent", label: "URGENT - Less than 24 hours" };
  }

  if (diffHours <= 72) {
    return { kind: "within72", label: "Within 72 hours" };
  }

  return undefined;
}

export async function getOpenSubstituteRequests(): Promise<SubstituteRequestCardData[]> {
  const currentClassType = aliasedTable(schema.classTypes, "current_class_type");
  const originalClassType = aliasedTable(schema.classTypes, "original_class_type");

  const rows = await db
    .select({
      id: schema.coverageRequests.id,
      reason: schema.coverageRequests.reason,
      status: schema.coverageRequests.status,
      classTypeChangeStatus: schema.coverageRequests.classTypeChangeStatus,
      startAt: schema.coverageRequests.startAt,
      requestedByFirstName: schema.profiles.firstName,
      requestedByLastName: schema.profiles.lastName,
      locationName: schema.locations.name,
      originalClassTypeName: originalClassType.name,
      currentClassTypeName: currentClassType.name,
    })
    .from(schema.coverageRequests)
    .innerJoin(
      schema.profiles,
      eq(schema.coverageRequests.requestedByInstructorId, schema.profiles.id),
    )
    .innerJoin(
      schema.locations,
      eq(schema.coverageRequests.locationId, schema.locations.id),
    )
    .innerJoin(
      currentClassType,
      eq(schema.coverageRequests.currentClassTypeId, currentClassType.id),
    )
    .innerJoin(
      originalClassType,
      eq(schema.coverageRequests.originalClassTypeId, originalClassType.id),
    )
    .where(inArray(schema.coverageRequests.status, ["open", "pending_approval"]))
    .orderBy(desc(schema.coverageRequests.startAt));

  return rows.map((row) => {
      const urgency = buildUrgency(row.startAt);
      const classChangeSummary =
        row.originalClassTypeName &&
        row.currentClassTypeName &&
        row.originalClassTypeName !== row.currentClassTypeName
          ? `${row.originalClassTypeName} -> ${row.currentClassTypeName}`
          : undefined;

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
      };
    });
}
