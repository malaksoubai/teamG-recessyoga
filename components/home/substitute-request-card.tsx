"use client"

import {
  AlertCircle,
  Check,
  Clock,
  ExternalLink,
  Info,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SubstituteRequestCardData } from "@/lib/substitute-requests";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import ClaimSubstituteModal from "@/components/claim-sub-model"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type SubstituteRequestCardProps = {
  request: SubstituteRequestCardData;
  onClaimed?: () => void;
};

function ClaimConfirmationDialog({
  open,
  onClose,
  isPending,
}: {
  open: boolean;
  onClose: () => void;
  isPending: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm bg-white rounded-2xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <div className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
              isPending ? "bg-amber-100" : "bg-[#e8f0e8]"
            )}>
              <Check className={cn("h-4 w-4", isPending ? "text-amber-600" : "text-[#1e461f]")} />
            </div>
            {isPending ? "Claim Submitted for Approval" : "Class Claimed!"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {isPending ? (
            <p className="text-sm text-gray-600">
              Your claim is <span className="font-medium text-amber-700">pending administrator approval</span> due to the class type change request. You will be notified once it is approved.
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              You have successfully claimed this substitute shift. You&apos;re all set!
            </p>
          )}

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5">
            <div className="flex items-start gap-2.5">
              <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  Action required: Update MindBody
                </p>
                <p className="mt-0.5 text-xs text-amber-700">
                  {isPending
                    ? "Once your claim is approved, remember to log this pick-up shift in MindBody."
                    : "Remember to log this pick-up shift in MindBody so it appears on the schedule."}
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={onClose}
            className="w-full rounded-xl bg-[#1e461f] text-white hover:opacity-90"
          >
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function SubstituteRequestCard({ request, onClaimed }: SubstituteRequestCardProps) {
  const [claimOpen, setClaimOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [claimedAsPending, setClaimedAsPending] = useState(false)

  const topBorder =
    request.borderTop === "urgent" ? "border-t-[#880808]" : "border-t-[#1e461f]";

  const initialStatus =
    request.dbStatus === "pending_approval"
      ? "pending"
      : request.dbStatus === "claimed" || request.dbStatus === "approved"
        ? "claimed"
        : "idle"
  const [status, setStatus] = useState<"idle" | "pending" | "claimed">(initialStatus)

  useEffect(() => {
    setStatus(
      request.dbStatus === "pending_approval"
        ? "pending"
        : request.dbStatus === "claimed" || request.dbStatus === "approved"
          ? "claimed"
          : "idle",
    )
  }, [request.dbStatus])

  return (
    <article
      className={cn(
        "overflow-hidden rounded-3xl border border-black/[0.06] bg-[#f1f5f0] shadow-[0_2px_12px_rgba(0,0,0,0.04)]",
        "border-t-4",
        topBorder,
      )}
    >
      <div className="p-4 sm:p-5">
        <div className="mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-heading text-lg font-bold tracking-tight text-[#1b1b1b]">
              {request.title}
            </h2>
            {request.needsApproval ? (
              <span className="rounded-md bg-[#e8e8e8] px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide text-[#5a5a5a]">
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
          {request.urgency ? (
            <li className="flex items-start gap-2">
              {request.urgency.kind === "urgent" ? (
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-[#880808]" />
              ) : (
                <Clock className="mt-0.5 size-4 shrink-0 text-[#6b6b6b]" />
              )}
              <span
                className={
                  request.urgency.kind === "urgent"
                    ? "font-semibold text-[#880808]"
                    : "text-[#6b6b6b]"
                }
              >
                {request.urgency.label}
              </span>
            </li>
          ) : null}
        </ul>

        {request.note ? (
          <div className="mt-4 rounded-xl bg-[#d4e0d4] px-3 py-2.5 text-sm text-[#1b1b1b]">
            {request.note}
          </div>
        ) : null}

        {request.classChangeSummary ? (
          <div className="mt-4 flex gap-2 rounded-xl border border-black/[0.06] bg-white px-3 py-2.5 text-sm text-[#1b1b1b]">
            <Info className="mt-0.5 size-4 shrink-0 text-[#1e461f]" />
            <span>
              <span className="font-semibold">Class Type Change Requested: </span>
              {request.classChangeSummary}
            </span>
          </div>
        ) : null}

        <Button
          onClick={() => status === "idle" && setClaimOpen(true)}
          disabled={status !== "idle"}
          className={cn(
            "mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-opacity",
            status === "idle" && "bg-black text-white hover:opacity-90",
            status === "pending" && "bg-amber-100 text-amber-700 cursor-not-allowed",
            status === "claimed" &&
              "cursor-not-allowed bg-[#e8ebe6] text-[#3d453d] hover:bg-[#e8ebe6]",
          )}
        >
          <Check className="size-4 shrink-0" aria-hidden />
          {status === "idle" && "Claim Substitute"}
          {status === "pending" && "Pending Approval"}
          {status === "claimed" &&
            (request.claimedByDisplayName
              ? `Claimed by ${request.claimedByDisplayName}`
              : "Claimed")}
        </Button>

        <ClaimSubstituteModal
          open={claimOpen}
          onOpenChange={setClaimOpen}
          onClaim={(classTypeOption) => {
            const isPending = classTypeOption === "change"
            setStatus(isPending ? "pending" : "claimed")
            setClaimedAsPending(isPending)
            setConfirmOpen(true)
            // onClaimed (refetch) is intentionally deferred to dialog close —
            // calling it here would remove the card from the list before the
            // popup renders.
          }}
          subRequest={{
            id: request.id,
            requestedBy: request.requestedBy,
            date: request.modalCalendarDate,
            time: request.modalTimeRange,
            location: request.location,
            classType: request.title,
            teacherNotes: request.note,
            urgency: request.claimModalUrgency,
          }}
        />

        <ClaimConfirmationDialog
          open={confirmOpen}
          onClose={() => {
            setConfirmOpen(false)
            onClaimed?.()
          }}
          isPending={claimedAsPending}
        />
      </div>
    </article>
  );
}
