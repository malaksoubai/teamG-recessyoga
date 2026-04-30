"use client"

import {
  AlertCircle,
  Check,
  Clock,
  Info,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SubstituteRequestCardData } from "@/lib/substitute-requests";
import { Button } from "../ui/button";
import { useState } from "react";
import ClaimSubstituteModal from "@/components/claim-sub-model"

type SubstituteRequestCardProps = {
  request: SubstituteRequestCardData;
};

export function SubstituteRequestCard({ request }: SubstituteRequestCardProps) {
  const [claimOpen, setClaimOpen] = useState(false)  
  const topBorder =
    request.borderTop === "urgent" ? "border-t-[#880808]" : "border-t-[#1e461f]";

  const [status, setStatus] = useState<"idle" | "pending" | "claimed">("idle")

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

        {/* <Button
          onClick={() => setClaimOpen(true)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-black py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <Check className="size-4" aria-hidden />
          Claim Substitute
        </Button> */}

        <Button
          onClick={() => status === "idle" && setClaimOpen(true)}
          disabled={status !== "idle"}
          className={cn(
            "mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-opacity",
            status === "idle" && "bg-black text-white hover:opacity-90",
            status === "pending" && "bg-amber-100 text-amber-700 cursor-not-allowed",
            status === "claimed" && "bg-[#1e461f] text-white cursor-not-allowed",
          )}
        >
          <Check className="size-4" aria-hidden />
          {status === "idle" && "Claim Substitute"}
          {status === "pending" && "Pending Approval"}
          {status === "claimed" && "Substitute Claimed"}
        </Button>

        <ClaimSubstituteModal
          open={claimOpen}
          onOpenChange={setClaimOpen}
          onClaim={(classTypeOption) => setStatus(classTypeOption === "change" ? "pending" : "claimed")}
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

      </div>
    </article>
  );
}
