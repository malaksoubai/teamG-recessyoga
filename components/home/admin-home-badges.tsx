import Link from "next/link"

type AdminHomeBadgesProps = {
  urgentCount: number
  pendingApprovalCount: number
  openCount: number
  loading: boolean
  /** Instructor sign-ups awaiting admin approval (`approved` false, `isActive` true). */
  pendingAccountApprovalCount: number
  pendingAccountApprovalsReady: boolean
}

export function AdminHomeBadges({
  urgentCount,
  pendingApprovalCount,
  openCount,
  loading,
  pendingAccountApprovalCount,
  pendingAccountApprovalsReady,
}: AdminHomeBadgesProps) {
  if (loading) {
    return (
      <div className="flex flex-wrap gap-2" aria-busy="true">
        <span className="inline-flex items-center rounded-full bg-[#880808]/70 px-3 py-1 text-xs font-medium text-white">
          …
        </span>
        <span className="inline-flex items-center rounded-full bg-[#3d4a38]/70 px-3 py-1 text-xs font-medium text-white">
          …
        </span>
        <span className="inline-flex items-center rounded-full bg-[#e8ede7] px-3 py-1 text-xs font-medium text-[#1b1b1b]">
          …
        </span>
      </div>
    )
  }

  const approvalLabel =
    pendingApprovalCount === 1
      ? "1 Need Approval"
      : `${pendingApprovalCount} Need Approval`

  const openLabel =
    openCount === 1 ? "1 Open Request" : `${openCount} Open Requests`

  const accountApprovalLabel =
    pendingAccountApprovalCount === 1
      ? "1 Pending Account Approval"
      : `${pendingAccountApprovalCount} Pending Account Approvals`

  const showAccountApprovalPill =
    pendingAccountApprovalsReady && pendingAccountApprovalCount > 0

  return (
    <div className="flex flex-wrap gap-2">
      <span className="inline-flex items-center rounded-full bg-[#880808] px-3 py-1 text-xs font-medium text-white">
        {urgentCount} Urgent
      </span>
      <span className="inline-flex items-center rounded-full bg-[#3d4a38] px-3 py-1 text-xs font-medium text-white">
        {approvalLabel}
      </span>
      <span className="inline-flex items-center rounded-full bg-[#e8ede7] px-3 py-1 text-xs font-medium text-[#1b1b1b]">
        {openLabel}
      </span>
      {showAccountApprovalPill ? (
        <Link
          href="/user-profile/pending-approvals"
          className="inline-flex items-center rounded-full bg-[#fde047] px-3 py-1 text-xs font-medium text-[#713f12] shadow-sm ring-1 ring-[#eab308]/60 transition-opacity hover:opacity-90"
        >
          {accountApprovalLabel}
        </Link>
      ) : null}
    </div>
  )
}
