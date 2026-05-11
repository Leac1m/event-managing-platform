import { router, publicProcedure, protectedProcedure } from './trpc.js';
import { z } from 'zod';
import { db } from '../db/index.js';
import { users } from '../db/schema/index.js';
import { hashPassword, comparePassword, generateToken } from '../utils/auth.js';
import { eq, or } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

export const appRouter = router({
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
});

export type AppRouter = typeof appRouter;
