"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, UserRound, Home } from "lucide-react";

const LOGO_WIDTH = 2250;
const LOGO_HEIGHT = 450;

export function TeacherHomeHeader() {
  const pathname = usePathname();

  const isUserProfilePage = pathname.startsWith("/user-profile");

  return (
    <header className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <Link href="/" className="inline-block max-w-full bg-transparent">
          <Image
            src="/recess-logo.png"
            alt="Recess Yoga Studio"
            width={LOGO_WIDTH}
            height={LOGO_HEIGHT}
            className="h-auto max-h-14 w-auto max-w-[min(280px,72vw)] object-contain object-left sm:max-h-16"
            priority
          />
        </Link>
      </div>

      <nav className="flex shrink-0 items-center gap-1 pt-0.5" aria-label="Account actions">

        {/* PROFILE ↔ HOME TOGGLE */}
        {isUserProfilePage ? (
          <Link
            href="/"
            className="flex size-10 items-center justify-center rounded-full text-[#1b1b1b] transition-colors hover:bg-[#f1f5f0]"
            aria-label="Home"
          >
            <Home className="size-6 stroke-[1.5]" />
          </Link>
        ) : (
          <Link
            href="/user-profile/profile-details"
            className="flex size-10 items-center justify-center rounded-full text-[#1b1b1b] transition-colors hover:bg-[#f1f5f0]"
            aria-label="Profile"
          >
            <UserRound className="size-6 stroke-[1.5]" />
          </Link>
        )}

        {/* LOGOUT */}
        <Link
          href="/logout"
          className="flex size-10 items-center justify-center rounded-full text-[#1b1b1b] transition-colors hover:bg-[#f1f5f0]"
          aria-label="Log out"
        >
          <LogOut className="size-6 stroke-[1.5]" />
        </Link>
      </nav>
    </header>
  );
}