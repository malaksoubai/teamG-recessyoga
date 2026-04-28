export default function PendingApprovalPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#eef1ec] px-4 text-center">
      <div className="max-w-md space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#7f8777] text-white text-2xl">
          ✓
        </div>
        <h1 className="text-2xl font-light text-[#78806f]">
          Account Created!
        </h1>
        <p className="text-sm text-[#7d837a]">
          Your account is pending approval from an admin. You will be notified
          once your account has been approved and you can start using the app.
        </p>
      </div>
    </main>
  );
}
