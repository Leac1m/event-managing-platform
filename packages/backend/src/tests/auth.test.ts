import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from '../trpc/router.js';
import { db } from '../db/index.js';
import { attendanceRecords, eventMembers, events, users } from '../db/schema/index.js';
import { eq } from 'drizzle-orm';

describe('Authentication', () => {
  beforeAll(async () => {
    await db.delete(attendanceRecords);
    await db.delete(eventMembers);
    await db.delete(events);
    await db.delete(users);
  });

  it('should register a new user', async () => {
    const caller = appRouter.createCaller({ user: null });

    const input = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      gender: 'Male' as const,
      department: 'IT',
    };

    const result = await caller.register(input);

    expect(result).toHaveProperty('id');
    expect(result.username).toBe(input.username);

    const dbUser = await db.query.users.findFirst({
      where: eq(users.username, input.username),
    });
    expect(dbUser).toBeDefined();
    expect(dbUser?.emailVerified).toBe(false);
  });

  it('should login with valid credentials after registration', async () => {
    const caller = appRouter.createCaller({ user: null });

    const [verifiedUser] = await db
      .update(users)
      .set({ emailVerified: true })
      .where(eq(users.username, 'testuser'))
      .returning();
    expect(verifiedUser).toBeDefined();

    const result = await caller.login({
      username: 'testuser',
      password: 'password123',
    });

    expect(result).toHaveProperty('token');
    expect(result.user.username).toBe('testuser');
  });

  it('should not allow duplicate username', async () => {
    const caller = appRouter.createCaller({ user: null });

    const input = {
      username: 'testuser',
      email: 'test2@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      gender: 'Male' as const,
      department: 'IT',
    };

    await expect(caller.register(input)).rejects.toThrow('Username or email already exists');
  });

  it('should not allow login with wrong password', async () => {
    const caller = appRouter.createCaller({ user: null });

    await db.update(users).set({ emailVerified: true }).where(eq(users.username, 'testuser'));

    await expect(
      caller.login({
        username: 'testuser',
        password: 'wrongpassword',
      }),
    ).rejects.toThrow('Invalid username or password');
  });

  it('should access me endpoint when authenticated', async () => {
    const dbUser = await db.query.users.findFirst({
      where: eq(users.username, 'testuser'),
    });
    expect(dbUser).toBeDefined();

    const user = { id: dbUser!.id, username: 'testuser' };
    const caller = appRouter.createCaller({ user });

    const result = await caller.me();
    expect(result).toMatchObject({
      id: dbUser!.id,
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      department: 'IT',
    });
  });
});
