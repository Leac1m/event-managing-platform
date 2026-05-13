# Contributing to Event Managing Platform

Thank you for your interest in contributing to the Event Managing Platform! We welcome contributions from the community. This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Reporting Issues](#reporting-issues)
- [Feature Requests](#feature-requests)

## Code of Conduct

This project adheres to a Code of Conduct. By participating, you are expected to uphold this code. Please read [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) for details.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/event-managing-platform.git
   cd event-managing-platform
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/ORIGINAL-OWNER/event-managing-platform.git
   ```
4. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Setup

### Prerequisites
- Node.js v22+
- pnpm v11+
- Git
- Docker & Docker Compose (for containerized testing)

### Initial Setup

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   export JWT_SECRET=dev-key-only
   export DATABASE_URL=./sqlite.db
   export PROFILE_UPLOAD_DIR=./uploads
   ```

3. **Initialize the database**
   ```bash
   pnpm --filter backend exec drizzle-kit push --config packages/backend/drizzle.config.ts
   ```

4. **Seed test data**
   ```bash
   JWT_SECRET=dev-key pnpm --filter backend db:seed
   ```

5. **Start development servers**
   ```bash
   # Terminal 1
   pnpm --filter backend dev
   
   # Terminal 2
   pnpm --filter frontend dev
   ```

6. **Verify everything works**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001
   - Login with: `organizer1 / password123`

## Making Changes

### Workflow

1. **Keep your fork synced**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Make your changes**
   - Work on your feature branch
   - Make logical, atomic commits with clear messages
   - Reference issues in commit messages: `Fix #123` or `Closes #456`

3. **Write tests** (see [Testing](#testing) section)

4. **Format and lint your code**
   ```bash
   pnpm format
   pnpm lint
   ```

5. **Type check**
   ```bash
   pnpm --filter backend exec tsc -p packages/backend/tsconfig.json
   pnpm --filter frontend exec tsc -p packages/frontend/tsconfig.json
   ```

### Branch Naming

Use descriptive branch names with prefixes:
- `feature/add-email-notifications` - New feature
- `fix/incorrect-attendance-count` - Bug fix
- `docs/update-api-docs` - Documentation
- `refactor/simplify-auth-logic` - Refactoring
- `test/improve-coverage` - Test improvements

### Commit Messages

Follow conventional commit format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Examples:
- `feat(auth): add two-factor authentication`
- `fix(scan): correct QR token parsing issue`
- `docs(readme): update installation instructions`
- `test(attendance): increase coverage to 90%`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`

## Coding Standards

### TypeScript

1. **Use strict type checking**
   - Enable `strict: true` in tsconfig.json
   - Avoid `any` types
   - Use `unknown` instead of `any` when necessary

2. **Type Safety**
   ```typescript
   // ✅ Good
   const getUserById = async (id: string): Promise<User | null> => {
     return db.query.users.findFirst({ where: eq(users.id, id) });
   };

   // ❌ Avoid
   const getUserById = async (id: any): Promise<any> => {
     return db.query.users.findFirst({ where: eq(users.id, id) });
   };
   ```

3. **Naming Conventions**
   - Use `camelCase` for variables and functions
   - Use `PascalCase` for types, interfaces, and classes
   - Use `UPPER_SNAKE_CASE` for constants
   - Use `is`, `has`, `can` prefixes for boolean variables

### React Components

1. **Functional Components Only**
   ```typescript
   // ✅ Good
   export default function EventCard({ event }: { event: Event }) {
     return <div>{event.name}</div>;
   }

   // ❌ Avoid class components
   ```

2. **Props Type Safety**
   ```typescript
   // ✅ Good
   interface EventCardProps {
     event: Event;
     onSelect?: (event: Event) => void;
   }

   export default function EventCard({ event, onSelect }: EventCardProps) {
     return /* JSX */;
   }
   ```

3. **Custom Hooks**
   ```typescript
   // ✅ Good
   function useEventData(eventId: string) {
     const [event, setEvent] = useState<Event | null>(null);
     const [loading, setLoading] = useState(false);
     
     useEffect(() => {
       // Fetch logic
     }, [eventId]);

     return { event, loading };
   }
   ```

### Backend

1. **Express Routes**
   ```typescript
   // ✅ Good - Clear error handling
   router.post('/api/auth/register', async (req, res) => {
     try {
       const result = await registerUser(req.body);
       res.json(result);
     } catch (error) {
       if (error instanceof ValidationError) {
         return res.status(400).json({ error: error.message });
       }
       res.status(500).json({ error: 'Internal server error' });
     }
   });
   ```

2. **Error Handling**
   - Use custom error classes
   - Include error codes for client handling
   - Log errors with context (user ID, request ID, etc.)

3. **Database Queries**
   ```typescript
   // ✅ Good - Type-safe with Drizzle
   const user = await db.query.users.findFirst({
     where: eq(users.email, email),
     with: { events: true },
   });

   // ✅ Good - Use transactions for multiple operations
   await db.transaction(async (tx) => {
     await tx.delete(eventMembers).where(eq(eventMembers.eventId, eventId));
     await tx.delete(events).where(eq(events.id, eventId));
   });
   ```

### File Organization

```
Backend:
├── src/
│   ├── index.ts           # Main server entry
│   ├── trpc/              # tRPC routes
│   ├── db/                # Database
│   ├── utils/             # Utility functions
│   ├── services/          # Business logic
│   └── tests/             # Test files

Frontend:
├── src/
│   ├── pages/             # Route components
│   ├── components/        # Reusable components
│   ├── lib/               # Utilities
│   ├── assets/            # Images, icons
│   └── App.tsx            # Root component
```

### Imports

1. **Order imports consistently**
   ```typescript
   // Standard library
   import fs from 'fs';
   import path from 'path';

   // Third-party
   import express from 'express';
   import { eq } from 'drizzle-orm';

   // Local
   import { db } from '../db';
   import type { User } from '../types';
   ```

2. **Use explicit imports**
   ```typescript
   // ✅ Good
   import { eq } from 'drizzle-orm';

   // ❌ Avoid
   import * as orm from 'drizzle-orm';
   ```

### Naming Files

- Components: `PascalCase.tsx` (e.g., `UserProfile.tsx`)
- Utilities: `camelCase.ts` (e.g., `dateUtils.ts`)
- Types: `camelCase.ts` (e.g., `userTypes.ts`) or `types.ts`
- Tests: `*.test.ts` or `*.spec.ts`

## Testing

### Running Tests

```bash
# Run all backend tests
pnpm --filter backend test

# Run tests in watch mode
pnpm --filter backend test:watch

# Run specific test file
pnpm --filter backend exec vitest run src/tests/auth.test.ts

# Run tests with coverage
pnpm --filter backend exec vitest run --coverage
```

### Writing Tests

1. **Test Structure**
   ```typescript
   import { describe, it, expect, beforeEach } from 'vitest';
   import { authHandler } from '../utils/auth';

   describe('Authentication', () => {
     let testUser: User;

     beforeEach(() => {
       testUser = { username: 'test', email: 'test@example.com' };
     });

     it('should hash password correctly', async () => {
       const hashed = await hashPassword('password123');
       expect(hashed).not.toEqual('password123');
       expect(hashed.length).toBeGreaterThan(20);
     });

     it('should verify correct password', async () => {
       const hash = await hashPassword('password123');
       const isValid = await verifyPassword('password123', hash);
       expect(isValid).toBe(true);
     });
   });
   ```

2. **Test Coverage**
   - Aim for at least 80% coverage
   - Test happy paths and error cases
   - Mock external dependencies

3. **Test Naming**
   - Use descriptive test names: `should validate email format correctly`
   - Start with "should" or "must"
   - Include expected behavior clearly

## Submitting Changes

### Before Submitting

1. **Update documentation**
   - Update README if adding features
   - Update API docs if changing endpoints
   - Add comments for complex logic

2. **Update tests**
   - Add tests for new features
   - Update tests for modified behavior
   - Ensure all tests pass

3. **Create a Clean History**
   ```bash
   # Rebase to clean up commits
   git rebase -i upstream/main
   ```

4. **Final Checks**
   ```bash
   pnpm format
   pnpm lint
   pnpm build
   pnpm --filter backend test
   ```

### Opening a Pull Request

1. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open a PR on GitHub**
   - Write a clear, descriptive title
   - Reference related issues: `Closes #123`
   - Describe what changed and why
   - Include before/after screenshots if UI changes

3. **PR Description Template**
   ```markdown
   ## Description
   Brief explanation of changes

   ## Related Issues
   Closes #123

   ## Changes
   - Change 1
   - Change 2
   - Change 3

   ## Testing
   How to test the changes:
   1. Step 1
   2. Step 2

   ## Checklist
   - [ ] Tests added/updated
   - [ ] Documentation updated
   - [ ] No breaking changes
   - [ ] Code formatted and linted
   ```

### Review Process

1. **Wait for review** - A maintainer will review your changes
2. **Address feedback** - Make requested changes
3. **Approval & Merge** - Once approved, your PR will be merged

## Reporting Issues

### Bug Reports

Provide as much detail as possible:

1. **Title**: Brief description of the bug
2. **Description**: Detailed explanation
3. **Steps to Reproduce**:
   ```
   1. Go to...
   2. Click on...
   3. See error...
   ```
4. **Expected Behavior**: What should happen
5. **Actual Behavior**: What actually happens
6. **Environment**:
   - OS: macOS/Linux/Windows
   - Node version: v22.x
   - Browser: Chrome/Firefox
7. **Screenshots/Logs**: Include if applicable

### Example Bug Report

```
Title: Login fails with long usernames

Description: When entering a username longer than 50 characters, 
the login form shows a validation error but doesn't clearly 
indicate the character limit.

Steps to Reproduce:
1. Navigate to login page
2. Enter username: "this_is_a_very_long_username_that_exceeds_the_limit"
3. Click Login
4. See vague error message

Expected: Clear error indicating max 50 characters
Actual: Generic error "Invalid username"

Environment: Node v22.1.0, Chrome 125
```

## Feature Requests

1. **Check existing issues** - Ensure your feature hasn't been requested
2. **Describe the use case** - Why is this feature needed?
3. **Provide examples** - How would users interact with it?
4. **Consider alternatives** - Are there workarounds?

### Example Feature Request

```
Title: Add bulk event export to CSV

Description: 
Users need to export event attendee lists to CSV for integration 
with external systems.

Use Case:
Event organizers want to export attendance records to share with 
HR systems for payroll and benefits tracking.

Proposed Solution:
Add an "Export to CSV" button on the attendance page that downloads 
a file with all attendee information.

Example Output:
First Name | Last Name | Email | Check-in Time | Department
John       | Doe       | john@... | 2026-05-13 09:15 | Engineering
```

## Questions?

- Open a [Discussion](https://github.com/yourusername/event-managing-platform/discussions)
- Ask in existing [Issues](https://github.com/yourusername/event-managing-platform/issues)
- Read the [documentation](./docs)

---

Thank you for contributing to Event Managing Platform! 🙏
