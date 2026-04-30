import { Resend } from 'resend'
import { db } from '@/app/server/db'
import { coverageRequests } from '@/app/db/schema'
import { eq } from 'drizzle-orm'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function notifySubClaim(coverageRequestId: number) {
  const request = await db.query.coverageRequests.findFirst({
    where: eq(coverageRequests.id, coverageRequestId),
    with: {
      originalClassType: true,
      location: true,
      requestedBy: true,
      claimedBy: true,
    }
  })

  if (!request) throw new Error('Coverage request not found')
  if (!request.claimedBy) throw new Error('No claimer found on request')

  const startDate = request.startAt.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
  const startTime = request.startAt.toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit'
  })
  const endTime = request.endAt.toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit'
  })

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: 'aleon4105@gmail.com', // TODO: revert to request.requestedBy.email once domain verified
    subject: `[TEST — would go to: ${request.requestedBy.email}] Your class has been covered`,
    html: buildClaimEmailHtml({
      requesterFirstName: request.requestedBy.firstName,
      claimerFullName: `${request.claimedBy.firstName} ${request.claimedBy.lastName}`,
      classType: request.originalClassType.name,
      location: request.location.name,
      date: startDate,
      startTime,
      endTime,
    }),
  })
}

function buildClaimEmailHtml(data: {
  requesterFirstName: string
  claimerFullName: string
  classType: string
  location: string
  date: string
  startTime: string
  endTime: string
}) {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="font-size:20px;font-weight:600;margin-bottom:4px">Your class is covered</h2>
      <p style="color:#6b7280;margin-bottom:20px">
        Hi ${data.requesterFirstName}, your sub request has been claimed.
      </p>
      <div style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:20px">
        <div style="padding:6px 14px;font-size:13px;font-weight:500;background:#f0fdf4;color:#166534;">
          Covered by ${data.claimerFullName}
        </div>
        <div style="padding:16px;background:#fff">
          <p style="margin:0 0 8px"><strong>${data.classType}</strong></p>
          <p style="margin:0 0 4px;color:#374151">${data.date}</p>
          <p style="margin:0 0 4px;color:#374151">${data.startTime} – ${data.endTime}</p>
          <p style="margin:0 0 4px;color:#374151">${data.location}</p>
        </div>
      </div>
      <p style="color:#6b7280;font-size:13px;text-align:center">
        No further action needed — your class is taken care of.
      </p>
    </div>
  `
}