"use client"

import { useState } from "react"
import { Plus } from "lucide-react"

import { AdminHomeBadges } from "@/components/home/admin-home-badges"
import { AdminHomeHeader } from "@/components/home/admin-home-header"
import { OpenSubstituteRequestsSection } from "@/components/home/open-substitute-requests-section"
import { useOpenSubstituteRequests } from "@/hooks/use-open-substitute-requests"
import RequestSubstituteModal from "@/components/request-sub-model"
import { Button } from "@/components/ui/button"

export function AdminHomeScreen() {
  const [requestOpen, setRequestOpen] = useState(false)
  const {
    items,
    status,
    urgentCount,
    openCount,
    pendingApprovalCount,
    refetch,
  } = useOpenSubstituteRequests()

  return (
    <div className="min-h-screen w-full bg-[#f2f2f2] text-[#1b1b1b]">
      <div className="mx-auto w-full max-w-[1400px] px-4 pb-12 pt-6 sm:px-6 lg:px-10 xl:px-12">
        <AdminHomeHeader />

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4 lg:mt-8">
          <AdminHomeBadges
            urgentCount={urgentCount}
            pendingApprovalCount={pendingApprovalCount}
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
          <RequestSubstituteModal open={requestOpen} onOpenChange={setRequestOpen} />
        </div>

        <div className="mt-8">
          <OpenSubstituteRequestsSection
            items={items}
            status={status}
            viewer="admin"
            onRequestsUpdated={refetch}
          />
        </div>
      </div>
    </div>
  )
}
