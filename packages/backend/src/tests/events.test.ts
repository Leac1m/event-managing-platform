import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from '../trpc/router.js';
import { db } from '../db/index.js';
import { attendanceRecords, users, events, eventMembers } from '../db/schema/index.js';
import { eq } from 'drizzle-orm';

describe('Events API', () => {
  let creatorId: string;
  let attendeeId: string;

  beforeAll(async () => {
    await db.delete(attendanceRecords);
    await db.delete(eventMembers);
    await db.delete(events);
    await db.delete(users);

    // Create a creator and an attendee
    const [creator] = await db
      .insert(users)
      .values({
        username: 'creator',
        email: 'creator@example.com',
        passwordHash: 'hash',
        firstName: 'Event',
        lastName: 'Creator',
        gender: 'Male',
        department: 'Admin',
      })
      .returning();
    creatorId = creator.id;

    const [attendee] = await db
      .insert(users)
      .values({
        username: 'attendee',
        email: 'attendee@example.com',
        passwordHash: 'hash',
        firstName: 'Event',
        lastName: 'Attendee',
        gender: 'Female',
        department: 'CS',
      })
      .returning();
    attendeeId = attendee.id;
  });

  it('should create a new event', async () => {
    const caller = appRouter.createCaller({ user: { id: creatorId, username: 'creator' } });

    const input = {
      name: 'Open Tech Talk',
      description: 'Discussing the future of web development',
      location: 'Main Hall',
      startTime: new Date(Date.now() + 86400000), // tomorrow
      endTime: new Date(Date.now() + 90000000),
      type: 'open' as const,
    };

    const result = await caller.createEvent(input);
    expect(result).toHaveProperty('id');
    expect(result.name).toBe(input.name);

    // Check if creator is added as an event member with 'creator' role
    const member = await db.query.eventMembers.findFirst({
      where: eq(eventMembers.eventId, result.id),
    });
    expect(member?.userId).toBe(creatorId);
    expect(member?.role).toBe('creator');
  });

  it('should list published events', async () => {
    const caller = appRouter.createCaller({ user: null });

    // Create another event and publish it
    const [event] = await db
      .insert(events)
      .values({
        name: 'Published Event',
        description: 'Public description',
        startTime: new Date(),
        endTime: new Date(),
        type: 'open',
        status: 'published',
      })
      .returning();

    const result = await caller.getEvents();
    expect(result.some((e) => e.id === event.id)).toBe(true);
  });

  it('should allow user to join an open event', async () => {
    const [event] = await db
      .insert(events)
      .values({
        name: 'Joinable Event',
        description: 'Try to join this',
        startTime: new Date(),
        endTime: new Date(),
        type: 'open',
        status: 'published',
      })
      .returning();

    const caller = appRouter.createCaller({ user: { id: attendeeId, username: 'attendee' } });
    await caller.joinEvent({ eventId: event.id });

    const member = await db.query.eventMembers.findFirst({
      where: eq(eventMembers.eventId, event.id),
    });
    expect(member?.userId).toBe(attendeeId);
    expect(member?.role).toBe('attendee');
  });

  it('should join private event with correct passcode', async () => {
    const [event] = await db
      .insert(events)
      .values({
        name: 'Private Party',
        description: 'Secret event',
        startTime: new Date(),
        endTime: new Date(),
        type: 'private',
        passcode: 'secret123',
        status: 'published',
      })
      .returning();

    const caller = appRouter.createCaller({ user: { id: attendeeId, username: 'attendee' } });

    // Fail with wrong passcode
    await expect(caller.joinPrivateEvent({ eventId: event.id, passcode: 'wrong' })).rejects.toThrow(
      'Invalid passcode',
    );

    // Succeed with correct passcode
    await caller.joinPrivateEvent({ eventId: event.id, passcode: 'secret123' });

    const member = await db.query.eventMembers.findFirst({
      where: eq(eventMembers.eventId, event.id),
    });
    expect(member?.userId).toBe(attendeeId);
  });
});
