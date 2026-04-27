import Link from "next/link";

export default function LogoutPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#ffffff] px-4 text-center text-[#1b1b1b]">
      <h1 className="text-2xl font-bold">Signed out</h1>
      <p className="mt-2 max-w-sm text-sm text-[#6b6b6b]">
        You have been logged out. In production this route would clear your
        session.
      </p>
      <Link
        href="/login"
        className="mt-8 rounded-xl bg-[#1e461f] px-5 py-2.5 text-sm font-semibold text-white"
      >
        Sign In
      </Link>
    </div>
  );
}
