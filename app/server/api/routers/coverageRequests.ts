import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { db } from '@/app/server/db';
import { coverageRequests, locations, classTypes } from '@/app/db/schema';
import { eq, and, gt, aliasedTable } from 'drizzle-orm';
import { notifySubRequest } from '@/app/notifications/notify-sub-request';
import { notifySubClaim } from '@/app/notifications/notify-sub-claim';

const getLocations = protectedProcedure
  .output(z.array(z.object({ id: z.number(), name: z.string() })))
  .query(async () => {
    const rows = await db.query.locations.findMany();
    return rows.map((r) => ({ id: r.id, name: r.name }));
  });

const getClassTypes = protectedProcedure
  .output(z.array(z.object({ id: z.number(), name: z.string() })))
  .query(async () => {
    const rows = await db.query.classTypes.findMany();
    return rows.map((r) => ({ id: r.id, name: r.name }));
  });

const createRequest = protectedProcedure
  .input(
    z.object({
      locationId: z.number().int().positive(),
      classTypeId: z.number().int().positive(),
      date: z.string(),       // "YYYY-MM-DD"
      startTime: z.string(),  // "HH:MM"
      endTime: z.string(),    // "HH:MM"
      reason: z.string().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { subject } = ctx;

    const startAt = new Date(`${input.date}T${input.startTime}`);
    const endAt = new Date(`${input.date}T${input.endTime}`);

    if (isNaN(startAt.getTime()) || isNaN(endAt.getTime())) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid date or time.' });
    }
    if (endAt <= startAt) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'End time must be after start time.' });
    }

    const [newRequest] = await db
      .insert(coverageRequests)
      .values({
        locationId: input.locationId,
        originalClassTypeId: input.classTypeId,
        currentClassTypeId: input.classTypeId,
        startAt,
        endAt,
        requestedByInstructorId: subject.id,
        reason: input.reason || null,
        status: 'open',
        classTypeChangeStatus: 'none',
      })
      .returning();

    // Fire-and-forget — don't let email errors fail the request
    notifySubRequest(newRequest.id).catch((err) =>
      console.error('Failed to send sub request notifications:', err)
    );

    return { id: newRequest.id };
  });

const claimRequest = protectedProcedure
  .input(
    z.object({
      requestId: z.number().int().positive(),
      classTypeOption: z.enum(['maintain', 'change']),
      newClassTypeId: z.number().int().positive().optional(),
      notes: z.string().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { subject } = ctx;

    const existing = await db.query.coverageRequests.findFirst({
      where: eq(coverageRequests.id, input.requestId),
    });

    if (!existing) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Coverage request not found.' });
    }
    if (existing.status !== 'open') {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'This request has already been claimed.' });
    }
    if (existing.requestedByInstructorId === subject.id) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'You cannot claim your own request.' });
    }

    if (input.classTypeOption === 'change') {
      if (!input.newClassTypeId) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'New class type is required.' });
      }
      await db
        .update(coverageRequests)
        .set({
          claimedByInstructorId: subject.id,
          status: 'pending_approval',
          classTypeChangeStatus: 'pending',
          currentClassTypeId: input.newClassTypeId,
          updatedAt: new Date(),
        })
        .where(eq(coverageRequests.id, input.requestId));
    } else {
      const [updatedRequest] = await db
        .update(coverageRequests)
        .set({
          claimedByInstructorId: subject.id,
          status: 'claimed',
          updatedAt: new Date(),
        })
        .where(eq(coverageRequests.id, input.requestId))
        .returning()
      notifySubClaim(updatedRequest.id).catch((err) =>
        console.error('Failed to send claim notification:', err)
      )  
    }

    return { success: true };
  });

// Returns the current instructor's approved class-type-change claims that are
// still upcoming (class hasn't happened yet). Used to show the MindBody reminder.
const getMyApprovedClassTypeChanges = protectedProcedure
  .output(
    z.array(
      z.object({
        id: z.number(),
        classTypeName: z.string(),
        locationName: z.string(),
        startAt: z.date(),
      })
    )
  )
  .query(async ({ ctx }) => {
    const { subject } = ctx;
    const currentClassType = aliasedTable(classTypes, 'current_class_type');

    const rows = await db
      .select({
        id: coverageRequests.id,
        classTypeName: currentClassType.name,
        locationName: locations.name,
        startAt: coverageRequests.startAt,
      })
      .from(coverageRequests)
      .innerJoin(currentClassType, eq(coverageRequests.currentClassTypeId, currentClassType.id))
      .innerJoin(locations, eq(coverageRequests.locationId, locations.id))
      .where(
        and(
          eq(coverageRequests.claimedByInstructorId, subject.id),
          eq(coverageRequests.classTypeChangeStatus, 'approved'),
          eq(coverageRequests.status, 'claimed'),
          gt(coverageRequests.startAt, new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)),
        )
      );
    return rows;
  });

export const coverageRequestsRouter = createTRPCRouter({
  getLocations,
  getClassTypes,
  createRequest,
  claimRequest,
  getMyApprovedClassTypeChanges,
});
