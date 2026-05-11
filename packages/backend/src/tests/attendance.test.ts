import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from '../trpc/router.js';
import { db } from '../db/index.js';
import { users, events, eventMembers, attendanceRecords } from '../db/schema/index.js';
import { eq } from 'drizzle-orm';

describe('Attendance & QR API', () => {
  let organizerId: string;
  let attendeeId: string;
  let eventId: string;

  beforeAll(async () => {
    await db.delete(attendanceRecords);
    await db.delete(eventMembers);
    await db.delete(events);
    await db.delete(users);

    const [organizer] = await db
      .insert(users)
      .values({
        username: 'organizer',
        email: 'org@example.com',
        passwordHash: 'hash',
        firstName: 'Org',
        lastName: 'User',
        gender: 'Male',
        department: 'Admin',
      })
      .returning();
    organizerId = organizer.id;

    const [attendee] = await db
      .insert(users)
      .values({
        username: 'attendee',
        email: 'att@example.com',
        passwordHash: 'hash',
        firstName: 'Att',
        lastName: 'User',
        gender: 'Female',
        department: 'CS',
        matricNumber: 'MAT123',
      })
      .returning();
    attendeeId = attendee.id;

    const [event] = await db
      .insert(events)
      .values({
        name: 'Scan Event',
        description: 'Test scanning',
        startTime: new Date(),
        endTime: new Date(),
        type: 'open',
        status: 'published',
      })
      .returning();
    eventId = event.id;

    await db.insert(eventMembers).values({
      userId: organizerId,
      eventId: eventId,
      role: 'organizer',
    });

    await db.insert(eventMembers).values({
      userId: attendeeId,
      eventId: eventId,
      role: 'attendee',
    });
  });

  it('should generate a QR token for the user', async () => {
    const caller = appRouter.createCaller({ user: { id: attendeeId, username: 'attendee' } });
    const result = await caller.getQRToken();
    expect(typeof result.token).toBe('string');
  });

  it('should allow organizer to scan a valid QR token', async () => {
    const attendeeCaller = appRouter.createCaller({
      user: { id: attendeeId, username: 'attendee' },
    });
    const { token } = await attendeeCaller.getQRToken();

    const organizerCaller = appRouter.createCaller({
      user: { id: organizerId, username: 'organizer' },
    });
    const scanResult = await organizerCaller.scanQR({ eventId, token });

    expect(scanResult.user.username).toBe('attendee');
    expect(scanResult.user.matricNumber).toBe('MAT123');

    // Check if attendance record was created
    const record = await db.query.attendanceRecords.findFirst({
      where: eq(attendanceRecords.userId, attendeeId),
    });
    expect(record).toBeDefined();
    expect(record?.scannedBy).toBe(organizerId);
  });

  it('should fail if user is not registered for the event', async () => {
    const [unregistered] = await db
      .insert(users)
      .values({
        username: 'unregistered',
        email: 'un@example.com',
        passwordHash: 'hash',
        firstName: 'Un',
        lastName: 'Reg',
        gender: 'Male',
        department: 'Bio',
      })
      .returning();

    const unregisteredCaller = appRouter.createCaller({
      user: { id: unregistered.id, username: 'unregistered' },
    });
    const { token } = await unregisteredCaller.getQRToken();

    const organizerCaller = appRouter.createCaller({
      user: { id: organizerId, username: 'organizer' },
    });
    await expect(organizerCaller.scanQR({ eventId, token })).rejects.toThrow(
      'User is not registered for this event',
    );
  });
});
