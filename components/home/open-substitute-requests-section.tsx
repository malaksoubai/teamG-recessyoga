"use client";

import { AdminSubstituteRequestCard } from "@/components/home/admin-substitute-request-card";
import { SubstituteRequestCard } from "@/components/home/substitute-request-card";
import type { OpenSubstituteRequestsStatus } from "@/hooks/use-open-substitute-requests";
import type { SubstituteRequestCardData } from "@/lib/substitute-requests";

type OpenSubstituteRequestsSectionProps = {
  items: SubstituteRequestCardData[];
  status: OpenSubstituteRequestsStatus;
  viewer?: "instructor" | "admin";
  onRequestsUpdated?: () => void | Promise<void>;
};

export function OpenSubstituteRequestsSection({
  items,
  status,
  viewer = "instructor",
  onRequestsUpdated,
}: OpenSubstituteRequestsSectionProps) {
  return (
    <section className="space-y-4" aria-labelledby="open-requests-heading">
      <h1
        id="open-requests-heading"
        className="text-xl font-bold tracking-tight text-[#1b1b1b] sm:text-2xl"
      >
        Open Substitute Requests
      </h1>

      {status === "loading" ? (
        <div className="rounded-2xl border border-black/[0.08] bg-[#f8faf7] px-4 py-6 text-sm text-[#596156]">
          Loading substitute requests...
        </div>
      ) : status === "error" ? (
        <div className="rounded-2xl border border-black/[0.08] bg-[#fff4f4] px-4 py-6 text-sm text-[#7a3e3e]">
          Could not load substitute requests right now.
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-black/[0.08] bg-[#f8faf7] px-4 py-6 text-sm text-[#596156]">
          No open substitute requests found.
        </div>
      ) : (
        <ul className="flex flex-col gap-6 sm:gap-8">
          {items.map((req) => (
            <li key={req.id} className="min-w-0">
              {viewer === "admin" ? (
                <AdminSubstituteRequestCard
                  request={req}
                  onUpdated={onRequestsUpdated}
                />
              ) : (
                <SubstituteRequestCard request={req} />
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
