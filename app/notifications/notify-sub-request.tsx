import { Resend } from 'resend'
import { db } from '@/app/server/db'
import {
  profiles,
  coverageRequests,
  instructorQualifications,
} from '@/app/db/schema'
import { eq, and, ne, inArray } from 'drizzle-orm'

const resend = new Resend(process.env.RESEND_API_KEY)

type UrgencyLevel = 'less-than-24h' | 'within-72h' | 'within-week' | 'over-week'

function getUrgency(startAt: Date): UrgencyLevel {
  const hoursUntil = (startAt.getTime() - Date.now()) / (1000 * 60 * 60)
  if (hoursUntil < 24)  return 'less-than-24h'
  if (hoursUntil < 72)  return 'within-72h'
  if (hoursUntil < 168) return 'within-week'
  return 'over-week'
}

type Recipient = { email: string; firstName: string }

async function getAdmins(): Promise<Recipient[]> {
  return db
    .select({ email: profiles.email, firstName: profiles.firstName })
    .from(profiles)
    .where(and(eq(profiles.isAdmin, true), eq(profiles.isActive, true)))
}

async function getAllStaff(excludeId: string): Promise<Recipient[]> {
  return db
    .select({ email: profiles.email, firstName: profiles.firstName })
    .from(profiles)
    .where(and(
      eq(profiles.isActive, true),
      eq(profiles.approved, true),
      eq(profiles.notificationPreference, 'email'),
      ne(profiles.id, excludeId)
    ))
}

async function getQualifiedForClassType(
  classTypeId: number,
  excludeId: string
): Promise<Recipient[]> {
  // Get instructor IDs qualified for this class type
  const qualified = await db
    .select({ instructorId: instructorQualifications.instructorId })
    .from(instructorQualifications)
    .where(eq(instructorQualifications.classTypeId, classTypeId))

  if (qualified.length === 0) return []

  const qualifiedIds = qualified.map((q: { instructorId: string }) => q.instructorId)

  // Fetch their profiles, filtering out inactive/unapproved/requester/no-email-pref
  return db
    .select({ email: profiles.email, firstName: profiles.firstName })
    .from(profiles)
    .where(and(
      inArray(profiles.id, qualifiedIds),
      eq(profiles.isActive, true),
      eq(profiles.approved, true),
      eq(profiles.notificationPreference, 'email'),
      ne(profiles.id, excludeId)
    ))
}

export async function notifySubRequest(coverageRequestId: number) {
  const request = await db.query.coverageRequests.findFirst({
    where: eq(coverageRequests.id, coverageRequestId),
    with: {
      location: true,
      originalClassType: true,
      requestedBy: true,
    }
  })
  if (!request) throw new Error('Coverage request not found')

  const urgency    = getUrgency(request.startAt)
  const requesterId = request.requestedByInstructorId

  const startDate = request.startAt.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
  const startTime = request.startAt.toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit'
  })
  const endTime = request.endAt.toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit'
  })

  const emailData = {
    classType: request.originalClassType.name,
    location: request.location.name,
    date: startDate,
    startTime,
    endTime,
    requestedBy: request.requestedBy.firstName,
    reason: request.reason ?? undefined,
    urgency,
  }

  if (urgency === 'less-than-24h') {
    // Only admins, direct alert
    const admins = await getAdmins()
    await sendToAll(admins, emailData)

  } else if (urgency === 'within-72h') {
    // Re-alert all staff AND alert admins
    const [staff, admins] = await Promise.all([
      getAllStaff(requesterId),
      getAdmins(),
    ])
    await sendToAll(dedupeByEmail([...staff, ...admins]), emailData)

  } else if (urgency === 'within-week') {
    // All staff
    const staff = await getAllStaff(requesterId)
    await sendToAll(staff, emailData)

  } else {
    // over-week: only instructors qualified for this class type
    const qualified = await getQualifiedForClassType(
      request.originalClassTypeId,
      requesterId
    )
    await sendToAll(qualified, emailData)
  }
}

function dedupeByEmail(recipients: Recipient[]): Recipient[] {
  const seen = new Set<string>()
  return recipients.filter(({ email }) => {
    if (seen.has(email)) return false
    seen.add(email)
    return true
  })
}

async function sendToAll(
  recipients: Recipient[],
  data: Omit<Parameters<typeof buildEmailHtml>[0], 'firstName'>
) {
  if (recipients.length === 0) return
  await Promise.all(
    recipients.map((r) =>
      resend.emails.send({
        from: 'Recess Yoga <noreply@yourdomain.com>',
        to: r.email,
        subject: `Sub needed: ${data.classType} on ${data.date}`,
        html: buildEmailHtml({ ...data, firstName: r.firstName }),
      })
    )
  )
}

function buildEmailHtml(data: {
  firstName: string
  classType: string
  location: string
  date: string
  startTime: string
  endTime: string
  requestedBy: string
  reason?: string
  urgency: UrgencyLevel
}) {
  const urgencyBanner: Record<UrgencyLevel, string> = {
    'less-than-24h': 'background:#fee2e2;color:#991b1b;',
    'within-72h':    'background:#ffedd5;color:#9a3412;',
    'within-week':   'background:#fefce8;color:#854d0e;',
    'over-week':     'background:#f1f5f9;color:#475569;',
  }
  const urgencyLabel: Record<UrgencyLevel, string> = {
    'less-than-24h': 'URGENT — Less than 24 hours',
    'within-72h':    'Within 72 hours',
    'within-week':   'Within 1 week',
    'over-week':     'Over 1 week out',
  }

  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="font-size:20px;font-weight:600;margin-bottom:4px">Sub request open</h2>
      <p style="color:#6b7280;margin-bottom:20px">
        Hi ${data.firstName}, a sub is needed for the following class.
      </p>
      <div style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:20px">
        <div style="padding:6px 14px;font-size:13px;font-weight:500;${urgencyBanner[data.urgency]}">
          ${urgencyLabel[data.urgency]}
        </div>
        <div style="padding:16px;background:#fff">
          <p style="margin:0 0 8px"><strong>${data.classType}</strong></p>
          <p style="margin:0 0 4px;color:#374151">${data.date}</p>
          <p style="margin:0 0 4px;color:#374151">${data.startTime} – ${data.endTime}</p>
          <p style="margin:0 0 4px;color:#374151">${data.location}</p>
          <p style="margin:0;color:#9ca3af;font-size:13px">Requested by ${data.requestedBy}</p>
        </div>
        ${data.reason ? `
        <div style="padding:12px 16px;background:#f9fafb;border-top:1px solid #e5e7eb">
          <p style="margin:0;font-size:13px;color:#6b7280;font-style:italic">"${data.reason}"</p>
        </div>` : ''}
      </div>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/subs"
         style="display:block;text-align:center;background:#4a5e4a;color:#fff;padding:12px;
                border-radius:8px;text-decoration:none;font-weight:500">
        View &amp; Claim
      </a>
    </div>
  `
}