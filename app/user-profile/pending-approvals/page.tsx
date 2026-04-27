"use client"

import { useState } from "react"
import { UserCheck } from "lucide-react"

import { TeacherHomeHeader } from "@/components/home/teacher-home-header"
import { UserProfileSidebar } from "@/components/user-profile/user-profile-sidebar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { trpc } from "@/lib/trpc/client"

export default function PendingApprovalsPage() {
  const { data: profile, isLoading: profileLoading } =
    trpc.profiles.getCurrentProfile.useQuery()
  const { data: pending, isLoading: listLoading, refetch } =
    trpc.profiles.getPendingProfiles.useQuery()
  const approve = trpc.profiles.approveProfile.useMutation()
  const deny = trpc.profiles.denyProfile.useMutation()
  const [actionError, setActionError] = useState<string | null>(null)

  const busy = approve.isPending || deny.isPending

  async function handleApprove(profileId: string) {
    setActionError(null)
    try {
      await approve.mutateAsync({ profileId })
      await refetch()
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : "Approve failed.")
    }
  }

  async function handleDeny(profileId: string) {
    setActionError(null)
    try {
      await deny.mutateAsync({ profileId })
      await refetch()
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : "Deny failed.")
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F1F5F0]">
      <div className="p-8 pb-4 bg-[color:var(--background)]">
        <TeacherHomeHeader />
      </div>

      <div className="flex gap-6 p-8 pt-4">
        <UserProfileSidebar
          active="pending-approvals"
          isAdmin={!!profile?.isAdmin}
        />

        <Card className="flex-1 w-4xl h-fit">
          <CardHeader className="text-[color:var(--secondary-foreground)] flex gap-4 w-full justify-center md:justify-start">
            <div className="flex items-center justify-center bg-[color:var(--secondary)] aspect-square rounded-lg p-3">
              <UserCheck color="var(--secondary-foreground)" size={30} />
            </div>
            <div className="flex-col items-start leading-tight">
              <CardTitle className="text-xl">Pending instructor approvals</CardTitle>
              <CardDescription>
                Approve to grant studio access, or deny to block the account.
              </CardDescription>
            </div>
          </CardHeader>

          <Separator className="mx-4 my-2" />

          <CardContent className="space-y-4">
            {actionError ? (
              <p className="text-sm text-red-600" role="alert">
                {actionError}
              </p>
            ) : null}

            {profileLoading || listLoading ? (
              <p className="text-sm text-muted-foreground py-4">Loading…</p>
            ) : !pending?.length ? (
              <p className="text-sm text-muted-foreground py-4">
                No pending instructor sign-ups right now.
              </p>
            ) : (
              <ul className="space-y-3">
                {pending.map((row) => (
                  <li
                    key={row.id}
                    className="flex flex-col gap-3 rounded-lg border border-[#e5e7eb] bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-[#1b1b1b]">
                        {row.firstName} {row.lastName}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">{row.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Signed up {row.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={busy}
                        onClick={() => void handleDeny(row.id)}
                        className="border-red-200 text-red-700 hover:bg-red-50"
                      >
                        Deny
                      </Button>
                      <Button
                        type="button"
                        disabled={busy}
                        onClick={() => void handleApprove(row.id)}
                        className="bg-[#1e461f] text-white hover:opacity-90"
                      >
                        Approve
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
