export function AdminHomeBadges() {
  return (
    <div className="flex flex-wrap gap-2">
      <span className="inline-flex items-center rounded-full bg-[#880808] px-3 py-1 text-xs font-medium text-white">
        4 Urgent
      </span>
      <span className="inline-flex items-center rounded-full bg-[#2d2d2d] px-3 py-1 text-xs font-medium text-white">
        1 Need Approval
      </span>
      <span className="inline-flex items-center rounded-full bg-[#e8ede7] px-3 py-1 text-xs font-medium text-[#1b1b1b]">
        6 Open Requests
      </span>
    </div>
  )
}
