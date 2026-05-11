import { relations, sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { v4 as uuidv4 } from 'uuid';

export const users = sqliteTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
  profileUrl: text('profile_url'),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  gender: text('gender', { enum: ['Male', 'Female'] }).notNull(),
  matricNumber: text('matric_number').unique(),
  department: text('department').notNull(),
  phoneNumber: text('phone_number'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const events = sqliteTable('events', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  name: text('name').notNull(),
  description: text('description').notNull(),
  location: text('location'),
  startTime: integer('start_time', { mode: 'timestamp' }).notNull(),
  endTime: integer('end_time', { mode: 'timestamp' }).notNull(),
  type: text('type', { enum: ['open', 'private'] }).notNull(),
  passcode: text('passcode'), // Required if type is private
  status: text('status', { enum: ['draft', 'published'] })
    .notNull()
    .default('draft'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const eventMembers = sqliteTable('event_members', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  eventId: text('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['creator', 'organizer', 'attendee'] }).notNull(),
  joinedAt: integer('joined_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const attendanceRecords = sqliteTable('attendance_records', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  eventId: text('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  scannedBy: text('scanned_by')
    .notNull()
    .references(() => users.id),
  scannedAt: integer('scanned_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const usersRelations = relations(users, ({ many }) => ({
  eventMembers: many(eventMembers),
  attendanceRecords: many(attendanceRecords),
}));

export const eventsRelations = relations(events, ({ many }) => ({
  members: many(eventMembers),
  attendance: many(attendanceRecords),
}));

export const eventMembersRelations = relations(eventMembers, ({ one }) => ({
  user: one(users, {
    fields: [eventMembers.userId],
    references: [users.id],
  }),
  event: one(events, {
    fields: [eventMembers.eventId],
    references: [events.id],
  }),
}));

export const attendanceRecordsRelations = relations(attendanceRecords, ({ one }) => ({
  event: one(events, {
    fields: [attendanceRecords.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [attendanceRecords.userId],
    references: [users.id],
  }),
  scanner: one(users, {
    fields: [attendanceRecords.scannedBy],
    references: [users.id],
  }),
}));
