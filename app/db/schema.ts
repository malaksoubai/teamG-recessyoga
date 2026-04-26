import {
  pgTable,
  pgSchema,
  uuid,
  text,
  boolean,
  timestamp,
  serial,
  integer,
  date,
  unique,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core';

import { relations } from "drizzle-orm"


// Reference Supabase auth.users
const auth = pgSchema('auth');

export const authUsers = auth.table('users', {
  id: uuid('id').primaryKey(),
});

// ENUMS
export const notificationPreferenceEnum = pgEnum('notification_preference', [
  'email',
  'sms',
]);

export const coverageRequestStatusEnum = pgEnum('coverage_request_status', [
  'open',
  'claimed',
  'pending_approval',
  'approved',
]);

export const classTypeChangeStatusEnum = pgEnum('class_type_change_status', [
  'none',
  'pending',
  'approved',
  'rejected',
]);

export const profiles = pgTable('profiles', {
  id: uuid('id')
    .primaryKey()
    .references(() => authUsers.id, { onDelete: 'cascade' }),

  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  bio: text('bio'),
  isAdmin: boolean('is_admin').notNull().default(false),
  approved: boolean('approved').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  notificationPreference: notificationPreferenceEnum('notification_preference')
    .notNull()
    .default('email'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const classTypes = pgTable('class_types', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  durationMinutes: integer('duration_minutes'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const instructorQualifications = pgTable(
  'instructor_qualifications',
  {
    id: serial('id').primaryKey(),

    instructorId: uuid('instructor_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),

    classTypeId: integer('class_type_id')
      .notNull()
      .references(() => classTypes.id, { onDelete: 'cascade' }),

    certificationName: text('certification_name'),

    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    instructorClassTypeUnique: unique().on(table.instructorId, table.classTypeId),
    instructorIdx: index('instructor_qualifications_instructor_id_idx').on(table.instructorId),
    classTypeIdx: index('instructor_qualifications_class_type_id_idx').on(table.classTypeId),
  })
);

export const locations = pgTable('locations', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  addressLine1: text('address_line1'),
  city: text('city'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const coverageRequests = pgTable(
  'coverage_requests',
  {
    id: serial('id').primaryKey(),

    originalClassTypeId: integer('original_class_type_id')
      .notNull()
      .references(() => classTypes.id, { onDelete: 'restrict' }),

    currentClassTypeId: integer('current_class_type_id')
      .notNull()
      .references(() => classTypes.id, { onDelete: 'restrict' }),

    locationId: integer('location_id')
      .notNull()
      .references(() => locations.id, { onDelete: 'restrict' }),

    startAt: timestamp('start_at', { withTimezone: true }).notNull(),
    endAt: timestamp('end_at', { withTimezone: true }).notNull(),

    requestedByInstructorId: uuid('requested_by_instructor_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'restrict' }),

    claimedByInstructorId: uuid('claimed_by_instructor_id').references(() => profiles.id, {
      onDelete: 'set null',
    }),

    reason: text('reason'),

    status: coverageRequestStatusEnum('status').notNull().default('open'),

    classTypeChangeStatus: classTypeChangeStatusEnum('class_type_change_status')
      .notNull()
      .default('none'),

    approvedByAdminId: uuid('approved_by_admin_id').references(() => profiles.id, {
      onDelete: 'set null',
    }),

    approvedAt: timestamp('approved_at', { withTimezone: true }),

    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    startAtIdx: index('coverage_requests_start_at_idx').on(table.startAt),
    requestedByIdx: index('coverage_requests_requested_by_instructor_id_idx').on(
      table.requestedByInstructorId
    ),
    claimedByIdx: index('coverage_requests_claimed_by_instructor_id_idx').on(
      table.claimedByInstructorId
    ),
  })
);

export const coverageRequestRelations = relations(coverageRequests, ({ one }) => ({
  location: one(locations, {
    fields: [coverageRequests.locationId],
    references: [locations.id],
  }),
  originalClassType: one(classTypes, {
    fields: [coverageRequests.originalClassTypeId],
    references: [classTypes.id],
  }),
  requestedBy: one(profiles, {
    fields: [coverageRequests.requestedByInstructorId],
    references: [profiles.id],
  }),
}))