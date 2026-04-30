"use client"

import { useState, useTransition } from "react"
import {
  AlertCircle,
  Clock,
  Info,
  MapPin,
} from "lucide-react"

import {
  approveClassTypeChange,
  denyClassTypeChange,
} from "@/app/actions/admin-coverage-request"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { SubstituteRequestCardData } from "@/lib/substitute-requests"

type AdminSubstituteRequestCardProps = {
  request: SubstituteRequestCardData
  onUpdated?: () => void | Promise<void>
}

const TIMELINE_BY_URGENCY: Record<
  SubstituteRequestCardData["claimModalUrgency"],
  string
> = {
  "less-than-24h": "URGENT - Less than 24 hours",
  "within-72h": "Within 72 hours",
  "within-week": "Within 1 week",
  "over-week": "Over 1 week out",
}

function adminTimeline(request: SubstituteRequestCardData) {
  if (request.urgency) {
    return {
      variant: request.urgency.kind === "urgent" ? ("urgent" as const) : ("muted" as const),
      label: request.urgency.label,
    }
  }
  return {
    variant: "muted" as const,
    label: TIMELINE_BY_URGENCY[request.claimModalUrgency],
  }
}

export function AdminSubstituteRequestCard({
  request,
  onUpdated,
}: AdminSubstituteRequestCardProps) {
  const [detailOpen, setDetailOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const showClassChangeActions =
    Boolean(request.needsApproval && request.classChangeSummary)

  const topBorderClass =
    request.borderTop === "urgent"
      ? "border-t-4 border-t-[#880808]"
      : "border-t-4 border-t-[#e0e0e0]"

  const timeline = adminTimeline(request)

  function runAction(
    action: typeof approveClassTypeChange | typeof denyClassTypeChange,
  ) {
    setError(null)
    startTransition(async () => {
      try {
        const id = Number.parseInt(request.id, 10)
        if (!Number.isFinite(id)) throw new Error("Invalid request")
        await action(id)
        await onUpdated?.()
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong")
      }
    })
  }

  const classChangeDisplay = request.classChangeSummary?.includes("->")
    ? request.classChangeSummary.replace("->", "→")
    : request.classChangeSummary

  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border border-[#e8e8e8] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]",
        topBorderClass,
      )}
    >
      <div className="p-4 sm:p-5">
        <div className="mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-heading text-lg font-bold tracking-tight text-[#1b1b1b]">
              {request.title}
            </h2>
            {request.needsApproval ? (
              <span className="rounded-md bg-[#3d4a38] px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-white">
                Needs Approval
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-sm text-[#6b6b6b]">
            Requested by {request.requestedBy}
          </p>
        </div>

        <ul className="space-y-2 text-sm text-[#1b1b1b]">
          <li className="flex items-start gap-2">
            <Clock className="mt-0.5 size-4 shrink-0 text-[#4a4a4a]" />
            <span>{request.dateTime}</span>
          </li>
          <li className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0 text-[#4a4a4a]" />
            <span>{request.location}</span>
          </li>
          <li className="flex items-start gap-2">
            {timeline.variant === "urgent" ? (
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-[#880808]" />
            ) : (
              <Clock className="mt-0.5 size-4 shrink-0 text-[#6b6b6b]" />
            )}
            <span
              className={
                timeline.variant === "urgent"
                  ? "font-semibold text-[#880808]"
                  : "text-[#6b6b6b]"
              }
            >
              {timeline.label}
            </span>
          </li>
        </ul>

        {request.note ? (
          <div className="mt-4 rounded-xl bg-[#eef4ee] px-3 py-2.5 text-sm text-[#1b1b1b]">
            {request.note}
          </div>
        ) : null}

        {request.classChangeSummary ? (
          <div className="mt-4 flex gap-2 rounded-xl bg-[#e8f0e4] px-3 py-3 text-sm text-[#1b1b1b]">
            <Info className="mt-0.5 size-4 shrink-0 text-[#3d4a38]" />
            <div>
              <p className="font-semibold">Class Type Change Requested</p>
              <p className="mt-0.5 text-[#374151]">{classChangeDisplay}</p>
            </div>
          </div>
        ) : null}

        {error ? (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        {showClassChangeActions ? (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              disabled={pending}
              onClick={() => runAction(approveClassTypeChange)}
              className="h-11 flex-1 rounded-xl bg-black text-sm font-semibold text-white hover:bg-black/90"
            >
              Approve
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => runAction(denyClassTypeChange)}
              className="h-11 flex-1 rounded-xl border-[#c8c8c8] bg-white text-sm font-semibold text-[#1b1b1b] hover:bg-[#fafafa]"
            >
              Deny
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="mt-4 h-11 w-full rounded-xl border-[#c8c8c8] bg-white text-sm font-semibold text-[#1b1b1b] hover:bg-[#fafafa]"
            onClick={() => setDetailOpen(true)}
          >
            View Details
          </Button>
        )}
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle className="font-heading">{request.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-left text-sm text-[#374151]">
            <p>Requested by {request.requestedBy}</p>
            <p>{request.dateTime}</p>
            <p>{request.location}</p>
            {request.note ? <p className="italic">Note: {request.note}</p> : null}
          </div>
        </DialogContent>
      </Dialog>
    </article>
  )
}
