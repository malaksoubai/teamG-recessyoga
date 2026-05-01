/**
 * Unit tests for notify-sub-request.ts
 *
 * All external dependencies (Resend, Drizzle db) are mocked —
 * no real emails are sent and no real DB calls are made.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Hoist mocks BEFORE vi.mock() calls ─────────────────────────────────────
const { mockSendEmail, mockFindFirst, mockSelect, mockGetResendOrNull } = vi.hoisted(() => {
  const mockSendEmail = vi.fn().mockResolvedValue({ id: 'mock-email-id' })
  const mockFindFirst = vi.fn()
  const mockSelect    = vi.fn()
  const mockGetResendOrNull = vi.fn(() => ({
    emails: { send: mockSendEmail },
  }))
  return { mockSendEmail, mockFindFirst, mockSelect, mockGetResendOrNull }
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
    select: mockSelect,
  },
}))

vi.mock('@/app/db/schema', () => ({
  profiles: {},
  coverageRequests: {},
  instructorQualifications: {},
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn(),
  and: vi.fn(),
  ne: vi.fn(),
  inArray: vi.fn(),
}))

// ─── Import after mocks ──────────────────────────────────────────────────────
import { notifySubRequest } from '@/app/notifications/notify-sub-request'

// ─── Shared test fixture ─────────────────────────────────────────────────────
const makeRequest = (hoursFromNow: number) => {
  const startAt = new Date(Date.now() + hoursFromNow * 60 * 60 * 1000)
  const endAt   = new Date(startAt.getTime() + 60 * 60 * 1000)
  return {
    id: 1,
    startAt,
    endAt,
    requestedByInstructorId: 'requester-uuid',
    originalClassTypeId: 1,
    reason: null,
    originalClassType: { name: 'Vinyasa' },
    location: { name: 'Carrboro Studio' },
    requestedBy: { firstName: 'Sarah', email: 'sarah@example.com' },
  }
}

function mockSelectChain(rows: unknown[]) {
  const chain = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockResolvedValue(rows),
  }
  mockSelect.mockReturnValue(chain)
  return chain
}

// ─── Tests ───────────────────────────────────────────────────────────────────
describe('notifySubRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetResendOrNull.mockReturnValue({ emails: { send: mockSendEmail } })
  })

  it('throws if coverage request is not found', async () => {
    mockFindFirst.mockResolvedValue(null)
    await expect(notifySubRequest(999)).rejects.toThrow('Coverage request not found')
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('over-week: sends email only to qualified instructors', async () => {
    mockFindFirst.mockResolvedValue(makeRequest(200))
    mockSelect
      .mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ instructorId: 'instructor-uuid-1' }]),
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([
          { email: 'qualified@example.com', firstName: 'Alex' },
        ]),
      })

    await notifySubRequest(1)

    expect(mockSendEmail).toHaveBeenCalledTimes(1)
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'qualified@example.com' })
    )
  })

  it('within-week: sends email to all active staff', async () => {
    mockFindFirst.mockResolvedValue(makeRequest(100))
    mockSelectChain([
      { email: 'teacher1@example.com', firstName: 'Jordan' },
      { email: 'teacher2@example.com', firstName: 'Riley' },
    ])

    await notifySubRequest(1)

    expect(mockSendEmail).toHaveBeenCalledTimes(2)
    expect(mockSendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: 'teacher1@example.com' }))
    expect(mockSendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: 'teacher2@example.com' }))
  })

  it('within-72h: sends email to staff and admins, deduped', async () => {
    mockFindFirst.mockResolvedValue(makeRequest(48))
    mockSelect
      .mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([
          { email: 'teacher@example.com', firstName: 'Morgan' },
          { email: 'admin@example.com',   firstName: 'Admin' },
        ]),
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([
          { email: 'admin@example.com', firstName: 'Admin' },
        ]),
      })

    await notifySubRequest(1)

    expect(mockSendEmail).toHaveBeenCalledTimes(2)
    const sentTo = mockSendEmail.mock.calls.map((c) => c[0].to)
    expect(sentTo).toContain('teacher@example.com')
    expect(sentTo).toContain('admin@example.com')
  })

  it('less-than-24h: sends email only to admins', async () => {
    mockFindFirst.mockResolvedValue(makeRequest(10))
    mockSelectChain([{ email: 'admin@example.com', firstName: 'Admin' }])

    await notifySubRequest(1)

    expect(mockSendEmail).toHaveBeenCalledTimes(1)
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'admin@example.com' })
    )
  })

  it('does not call Resend if recipient list is empty', async () => {
    mockFindFirst.mockResolvedValue(makeRequest(10))
    mockSelectChain([])

    await notifySubRequest(1)

    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('skips sending and does not throw if Resend is not configured', async () => {
    mockFindFirst.mockResolvedValue(makeRequest(10))
    mockSelectChain([{ email: 'admin@example.com', firstName: 'Admin' }])
    mockGetResendOrNull.mockImplementationOnce(() => null as any)
    await expect(notifySubRequest(1)).resolves.not.toThrow()
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('sends email with correct from address and subject', async () => {
    mockFindFirst.mockResolvedValue(makeRequest(10))
    mockSelectChain([{ email: 'admin@example.com', firstName: 'Admin' }])

    await notifySubRequest(1)

    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'subrequest@notifications.recessyogastudio.com',
        subject: expect.stringContaining('Vinyasa'),
        html: expect.stringContaining('Sub request open'),
      })
    )
  })
})