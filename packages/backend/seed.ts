import { db } from './src/db/index.js';
import { users, events, eventMembers } from './src/db/schema/index.js';
import { hashPassword } from './src/utils/auth.js';

async function seed() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  console.log('Clearing existing data...');
  await db.delete(eventMembers);
  await db.delete(events);
  await db.delete(users);

  // Create test users
  console.log('Creating test users...');
  const hashedPassword = await hashPassword('password123');

  const [organizer] = await db
    .insert(users)
    .values({
      username: 'organizer1',
      email: 'organizer@example.com',
      passwordHash: hashedPassword,
      emailVerified: true,
      firstName: 'Alice',
      lastName: 'Johnson',
      gender: 'Female',
      department: 'Event Management',
      matricNumber: 'EM001',
    })
    .returning();

  const [attendee1] = await db
    .insert(users)
    .values({
      username: 'attendee1',
      email: 'attendee1@example.com',
      passwordHash: hashedPassword,
      emailVerified: true,
      firstName: 'Bob',
      lastName: 'Smith',
      gender: 'Male',
      department: 'Computer Science',
      matricNumber: 'CS001',
    })
    .returning();

  const [attendee2] = await db
    .insert(users)
    .values({
      username: 'attendee2',
      email: 'attendee2@example.com',
      passwordHash: hashedPassword,
      emailVerified: true,
      firstName: 'Carol',
      lastName: 'Davis',
      gender: 'Female',
      department: 'Mathematics',
      matricNumber: 'MATH001',
    })
    .returning();

  const [attendee3] = await db
    .insert(users)
    .values({
      username: 'attendee3',
      email: 'attendee3@example.com',
      passwordHash: hashedPassword,
      emailVerified: true,
      firstName: 'David',
      lastName: 'Wilson',
      gender: 'Male',
      department: 'Physics',
      matricNumber: 'PHYS001',
    })
    .returning();

  console.log(`✓ Created ${4} users`);

  // Create sample events
  console.log('Creating sample events...');
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [openEvent] = await db
    .insert(events)
    .values({
      name: 'Tech Conference 2026',
      description:
        'A comprehensive conference covering the latest trends in technology, featuring keynote speakers from leading tech companies.',
      location: 'Main Hall, Building A',
      startTime: tomorrow,
      endTime: new Date(tomorrow.getTime() + 8 * 60 * 60 * 1000),
      type: 'open',
      status: 'published',
    })
    .returning();

  const [privateEvent] = await db
    .insert(events)
    .values({
      name: 'VIP Networking Dinner',
      description: 'Exclusive networking event for invited guests only. RSVP required.',
      location: 'Grand Ballroom',
      startTime: nextWeek,
      endTime: new Date(nextWeek.getTime() + 3 * 60 * 60 * 1000),
      type: 'private',
      passcode: 'VIP2026',
      status: 'published',
    })
    .returning();

  const [workshopEvent] = await db
    .insert(events)
    .values({
      name: 'Web Development Workshop',
      description: 'Hands-on workshop covering modern web development with React and Node.js.',
      location: 'Lab 3, Building B',
      startTime: new Date(tomorrow.getTime() + 2 * 24 * 60 * 60 * 1000),
      endTime: new Date(tomorrow.getTime() + 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      type: 'open',
      status: 'published',
    })
    .returning();

  const [draftEvent] = await db
    .insert(events)
    .values({
      name: 'Summer Hackathon',
      description: 'A 24-hour hackathon event for developers to build innovative projects.',
      location: 'Innovation Center',
      startTime: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() + 31 * 24 * 60 * 60 * 1000),
      type: 'open',
      status: 'draft',
    })
    .returning();

  console.log(`✓ Created ${4} events`);

  // Add event members
  console.log('Adding event members...');

  // Tech Conference: organizer as creator, attendees joined
  await db.insert(eventMembers).values({
    userId: organizer.id,
    eventId: openEvent.id,
    role: 'creator',
  });

  await db.insert(eventMembers).values([
    { userId: attendee1.id, eventId: openEvent.id, role: 'attendee' },
    { userId: attendee2.id, eventId: openEvent.id, role: 'attendee' },
    { userId: attendee3.id, eventId: openEvent.id, role: 'organizer' },
  ]);

  // VIP Networking: organizer as creator, some attendees joined
  await db.insert(eventMembers).values({
    userId: organizer.id,
    eventId: privateEvent.id,
    role: 'creator',
  });

  await db.insert(eventMembers).values([
    { userId: attendee1.id, eventId: privateEvent.id, role: 'attendee' },
    { userId: attendee2.id, eventId: privateEvent.id, role: 'attendee' },
  ]);

  // Workshop: organizer as creator, all attendees
  await db.insert(eventMembers).values({
    userId: organizer.id,
    eventId: workshopEvent.id,
    role: 'creator',
  });

  await db.insert(eventMembers).values([
    { userId: attendee1.id, eventId: workshopEvent.id, role: 'attendee' },
    { userId: attendee2.id, eventId: workshopEvent.id, role: 'attendee' },
    { userId: attendee3.id, eventId: workshopEvent.id, role: 'attendee' },
  ]);

  // Draft Hackathon: organizer only
  await db.insert(eventMembers).values({
    userId: organizer.id,
    eventId: draftEvent.id,
    role: 'creator',
  });

  console.log('✓ Added event members');

  console.log('\n✨ Database seeding complete!\n');
  console.log('Test credentials:');
  console.log('  Username: organizer1 | Email: organizer@example.com');
  console.log('  Username: attendee1 | Email: attendee1@example.com');
  console.log('  Username: attendee2 | Email: attendee2@example.com');
  console.log('  Username: attendee3 | Email: attendee3@example.com');
  console.log('  Password: password123 (all users)\n');
  console.log('Private event passcode: VIP2026\n');

  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
