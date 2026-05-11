import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from '../trpc/router.js';
import { db } from '../db/index.js';
import { users } from '../db/schema/index.js';
import { eq } from 'drizzle-orm';

describe('Authentication', () => {
  beforeAll(async () => {
    // Clear users for clean test run
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

    await expect(
      caller.login({
        username: 'testuser',
        password: 'wrongpassword',
      }),
    ).rejects.toThrow('Invalid username or password');
  });

  it('should access me endpoint when authenticated', async () => {
    const user = { id: 'some-id', username: 'testuser' };
    const caller = appRouter.createCaller({ user });

    const result = await caller.me();
    expect(result).toEqual(user);
  });
});
