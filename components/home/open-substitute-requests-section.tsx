"use client";

import { SubstituteRequestCard } from "@/components/home/substitute-request-card";
import type { SubstituteRequestCardData } from "@/lib/substitute-requests";
import type { OpenSubstituteRequestsStatus } from "@/hooks/use-open-substitute-requests";

type OpenSubstituteRequestsSectionProps = {
  items: SubstituteRequestCardData[];
  status: OpenSubstituteRequestsStatus;
};

export function OpenSubstituteRequestsSection({
  items,
  status,
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
              <SubstituteRequestCard request={req} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
