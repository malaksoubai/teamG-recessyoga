import Link from "next/link";

export default function SubstituteRequestPage() {
  return (
    <div className="min-h-screen bg-[#f1f5f0] px-4 py-10 text-[#1b1b1b]">
      <div className="mx-auto max-w-lg">
        <h1 className="text-2xl font-bold">Substitute request</h1>
        <p className="mt-2 text-sm text-[#6b6b6b]">
          This form will be wired up in a later milestone. Use the link below to
          return home.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-xl bg-[#1e461f] px-4 py-2.5 text-sm font-semibold text-white"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
