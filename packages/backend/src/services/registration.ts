import { TRPCError } from '@trpc/server';
import { or, eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users } from '../db/schema/index.js';
import { hashPassword } from '../utils/auth.js';

export type RegistrationInput = {
  id?: string;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  gender: 'Male' | 'Female';
  department: string;
  matricNumber?: string;
  phoneNumber?: string;
  profileUrl: string;
};

export async function registerUser(input: RegistrationInput) {
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
      id: input.id,
      ...input,
      passwordHash,
    })
    .returning();

  if (!newUser) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to create user',
    });
  }

  return newUser;
}
