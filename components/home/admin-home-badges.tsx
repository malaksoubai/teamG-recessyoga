type AdminHomeBadgesProps = {
  urgentCount: number;
  pendingApprovalCount: number;
  openCount: number;
  loading: boolean;
};

export function AdminHomeBadges({
  urgentCount,
  pendingApprovalCount,
  openCount,
  loading,
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
    );
  }

  const approvalLabel =
    pendingApprovalCount === 1
      ? "1 Need Approval"
      : `${pendingApprovalCount} Need Approval`;

  const openLabel =
    openCount === 1 ? "1 Open Request" : `${openCount} Open Requests`;

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
    </div>
  );
}
