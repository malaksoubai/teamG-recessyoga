"use client"

import Link from "next/link"
import { User, Bell, Award, UserCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export type UserProfileNavId =
  | "personal"
  | "notifications"
  | "specializations"
  | "pending-approvals"

type Props = {
  active: UserProfileNavId
  isAdmin: boolean
}

function navButtonClass(active: boolean) {
  return active
    ? "w-full justify-center md:justify-start gap-3 py-4 md:py-8 border-l-[var(--secondary-foreground)] border-l-2"
    : "w-full justify-center md:justify-start gap-3 py-4 md:py-8"
}

export function UserProfileSidebar({ active, isAdmin }: Props) {
  return (
    <Card className="w-20 md:w-1/4 h-fit transition-all">
      <CardContent className="p-3 space-y-3 text-lg text-[color:var(--secondary-foreground)]">
        <Button
          variant={active === "personal" ? "secondary" : "ghost"}
          className={navButtonClass(active === "personal")}
          asChild
        >
          <Link href="/user-profile/profile-details" className="flex w-full items-center gap-3">
            <div className="flex items-center justify-center bg-[color:var(--secondary-foreground)] rounded-lg p-2">
              <User color="white" />
            </div>
            <div className="hidden md:flex flex-col items-start leading-tight min-w-0 flex-1">
              <span className="font-medium">Personal Info</span>
              <span className="text-xs text-muted-foreground text-wrap text-start">
                Update your account details
              </span>
            </div>
          </Link>
        </Button>

        <Button
          variant={active === "notifications" ? "secondary" : "ghost"}
          className={navButtonClass(active === "notifications")}
          asChild
        >
          <Link href="/user-profile/notifications" className="flex w-full items-center gap-3">
            <div className="flex items-center justify-center bg-[color:var(--secondary-foreground)] rounded-lg p-2">
              <Bell color="white" />
            </div>
            <div className="hidden md:flex flex-col items-start leading-tight">
              <span className="font-medium">Notifications</span>
              <span className="text-xs text-muted-foreground text-wrap text-start">
                Manage your preferences
              </span>
            </div>
          </Link>
        </Button>

        <Button
          variant={active === "specializations" ? "secondary" : "ghost"}
          className={navButtonClass(active === "specializations")}
          asChild
        >
          <Link href="/user-profile/specializations" className="flex w-full items-center gap-3">
            <div className="flex items-center justify-center bg-[color:var(--secondary-foreground)] rounded-lg p-2">
              <Award color="white" />
            </div>
            <div className="hidden md:flex flex-col items-start leading-tight">
              <span className="font-medium">Specializations</span>
              <span className="text-xs text-muted-foreground text-wrap text-start">
                Update your qualifications
              </span>
            </div>
          </Link>
        </Button>

        {isAdmin ? (
          <Button
            variant={active === "pending-approvals" ? "secondary" : "ghost"}
            className={navButtonClass(active === "pending-approvals")}
            asChild
          >
            <Link href="/user-profile/pending-approvals" className="flex w-full items-center gap-3">
              <div className="flex items-center justify-center bg-[color:var(--secondary-foreground)] rounded-lg p-2">
                <UserCheck color="white" />
              </div>
              <div className="hidden md:flex flex-col items-start leading-tight min-w-0 flex-1">
                <span className="font-medium">Pending approvals</span>
                <span className="text-xs text-muted-foreground text-wrap text-start">
                  Review new instructor sign-ups
                </span>
              </div>
            </Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  )
}
