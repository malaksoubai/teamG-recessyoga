/**
 * tRPC router: profiles
 *
 * Procedures:
 *  getCurrentProfile   – protectedProcedure – fetch the signed-in user's profile
 *  createProfile       – protectedProcedure – insert profile + qualifications after sign-up
 *  getPendingProfiles  – adminProcedure     – list all unapproved profiles
 *  approveProfile      – adminProcedure     – set approved = true for a profile
 *
 * Handoff contract with Person 1 (Vy / frontend):
 *  - After supabase.auth.signUp() succeeds, frontend calls createProfile.
 *  - After login, frontend calls getCurrentProfile to determine redirect:
 *      profile not found          → show "complete profile" page
 *      profile.approved = false   → show "pending approval" page
 *      profile.approved = true    → go to dashboard
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure,
} from '../trpc';
import { db } from '@/app/server/db';
import {
  profiles,
  classTypes,
  instructorQualifications,
} from '@/app/db/schema';
import { eq, and } from 'drizzle-orm';

// ─── Zod schemas ──────────────────────────────────────────────────────────────

const ProfileResponse = z.object({
  id: z.string().uuid(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string().nullable(),
  bio: z.string().nullable(),
  isAdmin: z.boolean(),
  approved: z.boolean(),
  notificationPreference: z.enum(['email', 'sms']),
  createdAt: z.date(),
});

const CreateProfileInput = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  notificationPreference: z.enum(['email', 'sms']).default('email'),
  /** Class type names selected during sign-up (e.g. "Vinyasa", "Yin"). */
  selectedClassTypeNames: z.array(z.string()).default([]),
});

const ProfileIdInput = z.object({
  profileId: z.string().uuid(),
});

// ─── getCurrentProfile ────────────────────────────────────────────────────────

/**
 * Returns the currently authenticated instructor's profile.
 *
 * Frontend uses the return value to decide where to redirect:
 *  - approved = false → /pending-approval
 *  - approved = true  → /dashboard (or home)
 *
 * Throws NOT_FOUND if the profile row doesn't exist yet (user just signed up
 * with Supabase Auth but hasn't called createProfile yet).
 */
const getCurrentProfile = protectedProcedure
  .output(ProfileResponse)
  .query(async ({ ctx }) => {
    const { subject } = ctx;

    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.id, subject.id),
    });

    if (!profile) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Profile not found. Please complete your sign-up.',
      });
    }

    return ProfileResponse.parse(profile);
  });

// ─── createProfile ────────────────────────────────────────────────────────────

/**
 * Called by the frontend immediately after supabase.auth.signUp() succeeds.
 *
 * 1. Inserts a new row into `profiles` (approved = false by default — admin
 *    must approve before the instructor can access the app).
 * 2. For each selected class type name, looks up the matching row in
 *    `class_types` and inserts a row into `instructor_qualifications`.
 *    Class types not found in the DB are silently skipped.
 *
 * Idempotent: if the profile already exists, returns without error.
 */
const createProfile = protectedProcedure
  .input(CreateProfileInput)
  .mutation(async ({ ctx, input }) => {
    const { subject } = ctx;
    const {
      firstName,
      lastName,
      email,
      phone,
      notificationPreference,
      selectedClassTypeNames,
    } = input;

    // Idempotency guard — re-calling after a network retry should be safe.
    const existing = await db.query.profiles.findFirst({
      where: eq(profiles.id, subject.id),
    });
    if (existing) return;

    // Insert the profile row.
    await db.insert(profiles).values({
      id: subject.id, // must match auth.users.id
      firstName,
      lastName,
      email,
      phone: phone ?? null,
      notificationPreference,
      approved: false, // admin approves after reviewing
      isAdmin: false,
      isActive: true,
    });

    // Resolve class type names → IDs and insert qualifications.
    if (selectedClassTypeNames.length > 0) {
      const classTypeRows = await db.query.classTypes.findMany();

      const nameToId = new Map(
        classTypeRows.map((ct) => [ct.name.toLowerCase(), ct.id])
      );

      const qualifications = selectedClassTypeNames
        .map((name) => nameToId.get(name.toLowerCase()))
        .filter((id): id is number => id !== undefined)
        .map((classTypeId) => ({
          instructorId: subject.id,
          classTypeId,
        }));

      if (qualifications.length > 0) {
        await db
          .insert(instructorQualifications)
          .values(qualifications)
          .onConflictDoNothing(); // safe to retry
      }
    }
  });

// ─── getPendingProfiles ───────────────────────────────────────────────────────

/**
 * Admin only.
 * Returns all instructor profiles that have not been approved yet.
 * Used on the admin dashboard to review new sign-ups.
 */
const getPendingProfiles = adminProcedure
  .output(ProfileResponse.array())
  .query(async () => {
    const pending = await db.query.profiles.findMany({
      where: and(eq(profiles.approved, false), eq(profiles.isActive, true)),
    });

    return ProfileResponse.array().parse(pending);
  });

// ─── approveProfile ───────────────────────────────────────────────────────────

/**
 * Admin only.
 * Sets approved = true for the given profile ID.
 * After this, the instructor can log in and access the app.
 */
const approveProfile = adminProcedure
  .input(ProfileIdInput)
  .mutation(async ({ input }) => {
    const { profileId } = input;

    const target = await db.query.profiles.findFirst({
      where: eq(profiles.id, profileId),
    });

    if (!target) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Profile not found.',
      });
    }

    await db
      .update(profiles)
      .set({ approved: true, updatedAt: new Date() })
      .where(eq(profiles.id, profileId));
  });

// ─── Router ───────────────────────────────────────────────────────────────────

export const profilesApiRouter = createTRPCRouter({
  getCurrentProfile,
  createProfile,
  getPendingProfiles,
  approveProfile,
});
