import { router, publicProcedure, protectedProcedure } from './trpc.js';
import { z } from 'zod';
import { db } from '../db/index.js';
import { users, events, eventMembers, attendanceRecords } from '../db/schema/index.js';
import { hashPassword, comparePassword, generateToken, verifyToken } from '../utils/auth.js';
import { sendVerificationEmail } from '../utils/email.js';
import { eq, or, and } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

export const appRouter = router({
  // Auth
  register: publicProcedure
    .input(
      z.object({
        username: z.string(),
        email: z.string().email(),
        password: z.string().min(8),
        firstName: z.string(),
        lastName: z.string(),
        gender: z.enum(['Male', 'Female']),
        department: z.string(),
        matricNumber: z.string().optional(),
        phoneNumber: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const existingUser = await db.query.users.findFirst({
        where: or(eq(users.username, input.username), eq(users.email, input.email)),
      });

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Username or email already exists',
        });
      }

      const passwordHash = await hashPassword(input.password);

      const [newUser] = await db
        .insert(users)
        .values({
          ...input,
          passwordHash,
        })
        .returning();

      // Send verification email
      const verificationToken = generateToken({ id: newUser.id, type: 'email_verification' }, '24h');
      await sendVerificationEmail(newUser.email, verificationToken);

      return {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      };
    }),

  verifyEmail: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      let decoded: unknown;
      try {
        decoded = verifyToken(input.token);
      } catch {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid or expired token' });
      }

      if (
        !decoded ||
        typeof decoded !== 'object' ||
        !('type' in decoded) ||
        decoded.type !== 'email_verification' ||
        !('id' in decoded) ||
        typeof decoded.id !== 'string'
      ) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid token type' });
      }

      const [updatedUser] = await db
        .update(users)
        .set({ emailVerified: true })
        .where(eq(users.id, decoded.id))
        .returning();

      if (!updatedUser) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      }

      return { success: true };
    }),

  login: publicProcedure
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const user = await db.query.users.findFirst({
        where: eq(users.username, input.username),
      });

      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid username or password',
        });
      }

      if (!user.emailVerified) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Please verify your email before logging in',
        });
      }

      const isPasswordValid = await comparePassword(input.password, user.passwordHash);

      if (!isPasswordValid) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid username or password',
        });
      }

      const token = generateToken({ id: user.id, username: user.username });

      return {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      };
    }),

  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await db.query.users.findFirst({
      where: eq(users.id, ctx.user.id),
    });
    if (!user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      department: user.department,
      matricNumber: user.matricNumber,
      profileUrl: user.profileUrl,
      gender: user.gender,
      phoneNumber: user.phoneNumber,
    };
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        department: z.string().optional(),
        matricNumber: z.string().optional(),
        phoneNumber: z.string().optional(),
        profileUrl: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const [updatedUser] = await db
        .update(users)
        .set(input)
        .where(eq(users.id, ctx.user.id))
        .returning();
      return updatedUser;
    }),

  resendVerification: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const user = await db.query.users.findFirst({
        where: eq(users.email, input.email),
      });
      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      }
      if (user.emailVerified) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Email already verified' });
      }
      const token = generateToken({ id: user.id, type: 'email_verification' }, '24h');
      await sendVerificationEmail(user.email, token);
      return { success: true };
    }),

  // Events
  createEvent: protectedProcedure
    .input(
      z
        .object({
          name: z.string(),
          description: z.string(),
          location: z.string().optional(),
          startTime: z.coerce.date(),
          endTime: z.coerce.date(),
          type: z.enum(['open', 'private']),
          passcode: z.string().optional(),
        })
        .refine((data) => data.endTime > data.startTime, {
          message: 'End time must be later than start time',
          path: ['endTime'],
        }),
    )
    .mutation(async ({ input, ctx }) => {
      if (input.type === 'private' && !input.passcode) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Passcode is required for private events',
        });
      }

      const [newEvent] = await db.insert(events).values(input).returning();

      await db.insert(eventMembers).values({
        userId: ctx.user.id,
        eventId: newEvent.id,
        role: 'creator',
      });

      return newEvent;
    }),

  updateEvent: protectedProcedure
    .input(
      z
        .object({
          id: z.string(),
          name: z.string().optional(),
          description: z.string().optional(),
          location: z.string().optional(),
          startTime: z.coerce.date().optional(),
          endTime: z.coerce.date().optional(),
          type: z.enum(['open', 'private']).optional(),
          passcode: z.string().optional(),
        })
        .refine((data) => !data.startTime || !data.endTime || data.endTime > data.startTime, {
          message: 'End time must be later than start time',
          path: ['endTime'],
        }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const member = await db.query.eventMembers.findFirst({
        where: and(eq(eventMembers.eventId, id), eq(eventMembers.userId, ctx.user.id)),
      });

      if (!member || (member.role !== 'creator' && member.role !== 'organizer')) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized to update this event' });
      }

      const [updatedEvent] = await db.update(events).set(data).where(eq(events.id, id)).returning();
      return updatedEvent;
    }),

  deleteEvent: protectedProcedure.input(z.string()).mutation(async ({ input, ctx }) => {
    const member = await db.query.eventMembers.findFirst({
      where: and(eq(eventMembers.eventId, input), eq(eventMembers.userId, ctx.user.id)),
    });

    if (!member || member.role !== 'creator') {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Only the creator can delete the event' });
    }

    await db.delete(events).where(eq(events.id, input));
    return { success: true };
  }),

  publishEvent: protectedProcedure.input(z.string()).mutation(async ({ input, ctx }) => {
    const member = await db.query.eventMembers.findFirst({
      where: and(eq(eventMembers.eventId, input), eq(eventMembers.userId, ctx.user.id)),
    });

    if (!member || (member.role !== 'creator' && member.role !== 'organizer')) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized to publish this event' });
    }

    const [updatedEvent] = await db
      .update(events)
      .set({ status: 'published' })
      .where(eq(events.id, input))
      .returning();
    return updatedEvent;
  }),

  addOrganizer: protectedProcedure
    .input(z.object({ eventId: z.string(), username: z.string(), email: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const caller = await db.query.eventMembers.findFirst({
        where: and(eq(eventMembers.eventId, input.eventId), eq(eventMembers.userId, ctx.user.id)),
      });

      if (!caller || caller.role !== 'creator') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Only the creator can add organizers' });
      }

      const userToAdd = await db.query.users.findFirst({
        where: and(eq(users.username, input.username), eq(users.email, input.email)),
      });

      if (!userToAdd) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      }

      const [member] = await db
        .insert(eventMembers)
        .values({
          userId: userToAdd.id,
          eventId: input.eventId,
          role: 'organizer',
        })
        .returning();

      return member;
    }),

  removeOrganizer: protectedProcedure
    .input(z.object({ eventId: z.string(), userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const caller = await db.query.eventMembers.findFirst({
        where: and(eq(eventMembers.eventId, input.eventId), eq(eventMembers.userId, ctx.user.id)),
      });

      if (!caller || caller.role !== 'creator') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Only the creator can remove organizers' });
      }

      await db
        .delete(eventMembers)
        .where(and(eq(eventMembers.eventId, input.eventId), eq(eventMembers.userId, input.userId)));

      return { success: true };
    }),

  getEvents: publicProcedure.query(async () => {
    return db.query.events.findMany({
      where: eq(events.status, 'published'),
    });
  }),

  getMyEvents: protectedProcedure.query(async ({ ctx }) => {
    const members = await db.query.eventMembers.findMany({
      where: eq(eventMembers.userId, ctx.user.id),
      with: {
        event: true,
      },
    });
    return members.map((m) => m.event);
  }),

  getEventDetails: publicProcedure.input(z.string()).query(async ({ input }) => {
    const event = await db.query.events.findFirst({
      where: eq(events.id, input),
    });
    if (!event) {
      throw new TRPCError({ code: 'NOT_FOUND' });
    }
    return event;
  }),

  getMyEventRole: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const member = await db.query.eventMembers.findFirst({
      where: and(eq(eventMembers.eventId, input), eq(eventMembers.userId, ctx.user.id)),
    });

    if (!member) {
      return null;
    }

    return {
      role: member.role,
      eventId: member.eventId,
      userId: member.userId,
    };
  }),

  joinEvent: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const event = await db.query.events.findFirst({
        where: eq(events.id, input.eventId),
      });

      if (!event || event.status !== 'published') {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found or not published' });
      }

      if (event.type !== 'open') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'This is not an open event' });
      }

      const existingMember = await db.query.eventMembers.findFirst({
        where: and(eq(eventMembers.eventId, input.eventId), eq(eventMembers.userId, ctx.user.id)),
      });

      if (existingMember) {
        return existingMember;
      }

      const [member] = await db
        .insert(eventMembers)
        .values({
          userId: ctx.user.id,
          eventId: input.eventId,
          role: 'attendee',
        })
        .returning();

      return member;
    }),

  joinPrivateEvent: protectedProcedure
    .input(z.object({ eventId: z.string(), passcode: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const event = await db.query.events.findFirst({
        where: eq(events.id, input.eventId),
      });

      if (!event || event.status !== 'published') {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found or not published' });
      }

      if (event.type !== 'private') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'This is not a private event' });
      }

      if (event.passcode !== input.passcode) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid passcode' });
      }

      const existingMember = await db.query.eventMembers.findFirst({
        where: and(eq(eventMembers.eventId, input.eventId), eq(eventMembers.userId, ctx.user.id)),
      });

      if (existingMember) {
        return existingMember;
      }

      const [member] = await db
        .insert(eventMembers)
        .values({
          userId: ctx.user.id,
          eventId: input.eventId,
          role: 'attendee',
        })
        .returning();

      return member;
    }),

  // Attendance & QR
  getQRToken: protectedProcedure.query(({ ctx }) => {
    const token = generateToken({ id: ctx.user.id, type: 'qr' }, '5m');
    return { token };
  }),

  scanQR: protectedProcedure
    .input(z.object({ eventId: z.string(), token: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // 1. Verify caller is organizer/creator
      const callerRole = await db.query.eventMembers.findFirst({
        where: and(eq(eventMembers.eventId, input.eventId), eq(eventMembers.userId, ctx.user.id)),
      });

      if (!callerRole || (callerRole.role !== 'organizer' && callerRole.role !== 'creator')) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Only organizers can scan' });
      }

      // 2. Verify token
      let decoded: unknown;
      try {
        decoded = verifyToken(input.token);
      } catch {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid or expired QR code' });
      }

      if (
        !decoded ||
        typeof decoded !== 'object' ||
        !('type' in decoded) ||
        decoded.type !== 'qr' ||
        !('id' in decoded) ||
        typeof decoded.id !== 'string'
      ) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid QR code type' });
      }

      const userId = decoded.id;

      // 3. Verify user is registered for the event
      const member = await db.query.eventMembers.findFirst({
        where: and(eq(eventMembers.eventId, input.eventId), eq(eventMembers.userId, userId)),
        with: {
          user: true,
        },
      });

      if (!member) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User is not registered for this event',
        });
      }

      const existingAttendance = await db.query.attendanceRecords.findFirst({
        where: and(eq(attendanceRecords.eventId, input.eventId), eq(attendanceRecords.userId, userId)),
      });

      if (!existingAttendance) {
        // 4. Record attendance
        await db.insert(attendanceRecords).values({
          eventId: input.eventId,
          userId: userId,
          scannedBy: ctx.user.id,
        });
      }

      return {
        user: {
          username: member.user.username,
          firstName: member.user.firstName,
          lastName: member.user.lastName,
          department: member.user.department,
          matricNumber: member.user.matricNumber,
          profileUrl: member.user.profileUrl,
        },
      };
    }),

  getAttendance: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const callerRole = await db.query.eventMembers.findFirst({
      where: and(eq(eventMembers.eventId, input), eq(eventMembers.userId, ctx.user.id)),
    });

    if (!callerRole || (callerRole.role !== 'organizer' && callerRole.role !== 'creator')) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Only organizers can view attendance' });
    }

    return db.query.attendanceRecords.findMany({
      where: eq(attendanceRecords.eventId, input),
      with: {
        user: true,
        scanner: true,
      },
    });
  }),
});

export type AppRouter = typeof appRouter;
