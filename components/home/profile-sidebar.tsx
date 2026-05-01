"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, Bell, Award, UserCheck } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useUserProfileGate } from "@/components/user-profile/user-profile-gate-provider"

const items = [
  {
    label: "Personal Info",
    description: "Update your account details",
    href: "/user-profile/profile-details",
    icon: User,
  },
  {
    label: "Notifications",
    description: "Manage your preferences",
    href: "/user-profile/notifications",
    icon: Bell,
  },
  {
    label: "Specializations",
    description: "Update your qualifications",
    href: "/user-profile/specializations",
    icon: Award,
  },
] as const

const pendingApprovalsHref = "/user-profile/pending-approvals" as const

export function ProfileSidebar() {
  const pathname = usePathname()
  const { isAdmin } = useUserProfileGate()

  return (
    <Card className="w-64 shrink-0 h-fit transition-all">
      <CardContent className="p-3 space-y-3 text-lg text-[color:var(--secondary-foreground)]">

        {items.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Button
              key={item.href}
              variant={isActive ? "secondary" : "ghost"}
              className={`w-full justify-center md:justify-start gap-3 py-4 md:py-8 ${
                isActive ? "border-l-2 border-l-[var(--secondary-foreground)]" : ""
              }`}
              asChild
            >
              <Link href={item.href} className="flex w-full items-center gap-3">

                <div className="flex items-center justify-center bg-[color:var(--secondary-foreground)] rounded-lg p-2">
                  <Icon color="white" />
                </div>

                <div className="hidden md:flex flex-col items-start leading-tight">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-xs text-muted-foreground text-start">
                    {item.description}
                  </span>
                </div>

              </Link>
            </Button>
          )
        })}

        {isAdmin ? (
          <Button
            variant={pathname === pendingApprovalsHref ? "secondary" : "ghost"}
            className={`w-full justify-center md:justify-start gap-3 py-4 md:py-8 ${
              pathname === pendingApprovalsHref
                ? "border-l-2 border-l-[var(--secondary-foreground)]"
                : ""
            }`}
            asChild
          >
            <Link href={pendingApprovalsHref} className="flex w-full items-center gap-3">
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