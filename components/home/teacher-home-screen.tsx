"use client"

import { Plus, ExternalLink, X } from "lucide-react";
import { useState, useEffect } from "react";

import { TeacherHomeHeader } from "@/components/home/teacher-home-header";
import { TeacherHomeBadges } from "@/components/home/teacher-home-badges";
import { OpenSubstituteRequestsSection } from "@/components/home/open-substitute-requests-section";
import { useOpenSubstituteRequests } from "@/hooks/use-open-substitute-requests";
import RequestSubstituteModal from "@/components/request-sub-model"
import { Button } from "../ui/button";
import { trpc } from "@/lib/trpc/client";

export function TeacherHomeScreen() {
  const [requestOpen, setRequestOpen] = useState(false)
  const { items, status, urgentCount, openCount, refetch } = useOpenSubstituteRequests()
  const { data: profile } = trpc.profiles.getCurrentProfile.useQuery()
  const { data: approvedChanges = [] } = trpc.coverageRequests.getMyApprovedClassTypeChanges.useQuery()
  const [dismissedIds, setDismissedIds] = useState<number[]>([])

  useEffect(() => {
    if (!profile?.id) return
    try {
      const stored = localStorage.getItem(`mindbody-dismissed-${profile.id}`)
      if (stored) setDismissedIds(JSON.parse(stored))
    } catch {}
  }, [profile?.id])

  const handleDismiss = (id: number) => {
    if (!profile?.id) return
    const next = [...dismissedIds, id]
    setDismissedIds(next)
    try {
      localStorage.setItem(`mindbody-dismissed-${profile.id}`, JSON.stringify(next))
    } catch {}
  }

  // Don't render until profile is loaded — dismissedIds depends on profile.id
  const visibleReminders = profile
    ? approvedChanges.filter((c) => !dismissedIds.includes(c.id))
    : []

  return (
    <div className="min-h-screen w-full bg-[#ffffff] text-[#1b1b1b]">
      <div className="mx-auto w-full max-w-[1400px] px-4 pb-12 pt-6 sm:px-6 lg:px-10 xl:px-12">
        <TeacherHomeHeader />

        {/* MindBody reminders for approved class-type-change claims */}
        {visibleReminders.length > 0 && (
          <div className="mt-6 space-y-2">
            {visibleReminders.map((claim) => (
              <div
                key={claim.id}
                className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3"
              >
                <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div className="flex-1 text-sm">
                  <span className="font-semibold text-amber-800">Action required: Update MindBody — </span>
                  <span className="text-amber-700">
                    Your class type change for{" "}
                    <span className="font-medium">{claim.classTypeName}</span> at{" "}
                    <span className="font-medium">{claim.locationName}</span> on{" "}
                    <span className="font-medium">
                      {new Date(claim.startAt).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>{" "}
                    has been approved. Remember to log this pick-up shift in MindBody.
                  </span>
                </div>
                <button
                  onClick={() => handleDismiss(claim.id)}
                  className="ml-1 shrink-0 text-amber-500 hover:text-amber-700"
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4 lg:mt-8">
          <TeacherHomeBadges
            urgentCount={urgentCount}
            openCount={openCount}
            loading={status === "loading"}
          />

          <Button
            onClick={() => setRequestOpen(true)}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 self-start rounded-xl bg-[#1e461f] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95 active:opacity-90 sm:self-center"
          >
            <Plus className="size-4" strokeWidth={2.5} aria-hidden />
            Request Sub
          </Button>
          <RequestSubstituteModal open={requestOpen} onOpenChange={setRequestOpen} onCreated={refetch} />
        </div>

        <div className="mt-8">
          <OpenSubstituteRequestsSection items={items} status={status} onRequestsUpdated={refetch} />
        </div>
      </div>
    </div>
  );
}
