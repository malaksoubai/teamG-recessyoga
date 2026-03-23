import { SubstituteRequestCard } from "@/components/home/substitute-request-card";
import { MOCK_SUBSTITUTE_REQUESTS } from "@/lib/mock-substitute-requests";

export function OpenSubstituteRequestsSection() {
  return (
    <section className="space-y-4" aria-labelledby="open-requests-heading">
      <h1
        id="open-requests-heading"
        className="text-xl font-bold tracking-tight text-[#1b1b1b] sm:text-2xl"
      >
        Open Substitute Requests
      </h1>

      <ul className="flex flex-col gap-6 sm:gap-8">
        {MOCK_SUBSTITUTE_REQUESTS.map((req) => (
          <li key={req.id} className="min-w-0">
            <SubstituteRequestCard request={req} />
          </li>
        ))}
      </ul>
    </section>
  );
}
