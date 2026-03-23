import Link from "next/link";
import { Plus } from "lucide-react";
import { TeacherHomeHeader } from "@/components/home/teacher-home-header";
import { TeacherHomeBadges } from "@/components/home/teacher-home-badges";
import { OpenSubstituteRequestsSection } from "@/components/home/open-substitute-requests-section";

export function TeacherHomeScreen() {
  return (
    <div className="min-h-screen w-full bg-[#ffffff] text-[#1b1b1b]">
      <div className="mx-auto w-full max-w-[1400px] px-4 pb-12 pt-6 sm:px-6 lg:px-10 xl:px-12">
        <TeacherHomeHeader />

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4 lg:mt-8">
          <TeacherHomeBadges />

          <Link
            href="/substitute-request"
            className="inline-flex shrink-0 items-center justify-center gap-1.5 self-start rounded-xl bg-[#1e461f] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95 active:opacity-90 sm:self-center"
          >
            <Plus className="size-4" strokeWidth={2.5} aria-hidden />
            Request Sub
          </Link>
        </div>

        <div className="mt-8">
          <OpenSubstituteRequestsSection />
        </div>
      </div>
    </div>
  );
}
