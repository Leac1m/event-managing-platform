import { router, publicProcedure, protectedProcedure } from './trpc.js';
import { z } from 'zod';
import { db } from '../db/index.js';
import { users, events, eventMembers } from '../db/schema/index.js';
import { hashPassword, comparePassword, generateToken } from '../utils/auth.js';
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

      return {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      };
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

  me: protectedProcedure.query(({ ctx }) => {
    return ctx.user;
  }),

  // Events
  createEvent: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        location: z.string().optional(),
        startTime: z.date(),
        endTime: z.date(),
        type: z.enum(['open', 'private']),
        passcode: z.string().optional(),
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
});

export type AppRouter = typeof appRouter;
