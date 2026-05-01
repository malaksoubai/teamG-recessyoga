/**
 * Unit tests for notify-sub-claim.ts
 *
 * All external dependencies (Resend, Drizzle db) are mocked —
 * no real emails are sent and no real DB calls are made.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Hoist mocks BEFORE vi.mock() calls ─────────────────────────────────────
const { mockSendEmail, mockFindFirst, mockGetResendOrNull } = vi.hoisted(() => {
  const mockSendEmail = vi.fn().mockResolvedValue({ id: 'mock-email-id' })
  const mockFindFirst = vi.fn()
  const mockGetResendOrNull = vi.fn(() => ({
    emails: { send: mockSendEmail },
  }))
  return { mockSendEmail, mockFindFirst, mockGetResendOrNull }
})

// ─── Mocks ───────────────────────────────────────────────────────────────────
vi.mock('@/lib/resend', () => ({
  getResendOrNull: mockGetResendOrNull,
}))

vi.mock('@/app/server/db', () => ({
  db: {
    query: {
      coverageRequests: {
        findFirst: mockFindFirst,
      },
    },
  },
}))

vi.mock('@/app/db/schema', () => ({
  coverageRequests: {},
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn(),
}))

// ─── Import after mocks ──────────────────────────────────────────────────────
import { notifySubClaim } from '@/app/notifications/notify-sub-claim'

// ─── Shared test fixture ─────────────────────────────────────────────────────
const makeRequest = () => ({
  id: 1,
  startAt: new Date('2026-06-15T09:00:00'),
  endAt:   new Date('2026-06-15T10:00:00'),
  originalClassType: { name: 'Vinyasa' },
  location: { name: 'Carrboro Studio' },
  requestedBy: {
    firstName: 'Sarah',
    email: 'sarah@example.com',
  },
  claimedBy: {
    firstName: 'Alex',
    lastName: 'Johnson',
    email: 'alex@example.com',
  },
})

// ─── Tests ───────────────────────────────────────────────────────────────────
describe('notifySubClaim', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetResendOrNull.mockReturnValue({ emails: { send: mockSendEmail } })
  })

  it('throws if coverage request is not found', async () => {
    mockFindFirst.mockResolvedValue(null)
    await expect(notifySubClaim(999)).rejects.toThrow('Coverage request not found')
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('throws if claimedBy is null', async () => {
    mockFindFirst.mockResolvedValue({ ...makeRequest(), claimedBy: null })
    await expect(notifySubClaim(1)).rejects.toThrow('No claimer found on request')
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('sends email to the requester with correct to, from, and subject', async () => {
    mockFindFirst.mockResolvedValue(makeRequest())

    await notifySubClaim(1)

    expect(mockSendEmail).toHaveBeenCalledTimes(1)
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'subrequest@notifications.recessyogastudio.com',
        to: 'sarah@example.com',
        subject: 'Your class has been covered!',
      })
    )
  })

  it('email body contains the claimer full name', async () => {
    mockFindFirst.mockResolvedValue(makeRequest())
    await notifySubClaim(1)
    const html = mockSendEmail.mock.calls[0][0].html as string
    expect(html).toContain('Alex Johnson')
  })

  it('email body contains class type and location', async () => {
    mockFindFirst.mockResolvedValue(makeRequest())
    await notifySubClaim(1)
    const html = mockSendEmail.mock.calls[0][0].html as string
    expect(html).toContain('Vinyasa')
    expect(html).toContain('Carrboro Studio')
  })

  it('email body greets the requester by first name', async () => {
    mockFindFirst.mockResolvedValue(makeRequest())
    await notifySubClaim(1)
    const html = mockSendEmail.mock.calls[0][0].html as string
    expect(html).toContain('Hi Sarah')
  })

  it('skips sending and does not throw if Resend is not configured', async () => {
    mockFindFirst.mockResolvedValue(makeRequest())
    mockGetResendOrNull.mockImplementationOnce(() => null as any)
    await expect(notifySubClaim(1)).resolves.not.toThrow()
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('propagates error if Resend send fails', async () => {
    mockFindFirst.mockResolvedValue(makeRequest())
    mockSendEmail.mockRejectedValueOnce(new Error('Resend network error'))
    await expect(notifySubClaim(1)).rejects.toThrow('Resend network error')
  })
})