# Event Management Platform - Roadmap

## Phase 1: Workspace & Tooling Setup [x]
- Initialize a monorepo structure using pnpm workspaces.
- Create `packages/backend` and `packages/frontend`.
- Set up TypeScript configurations, ESLint, and Prettier at the root and package levels.
- Verification: Successful `pnpm install` and lint/build check.

## Phase 2: Database & Backend Foundation [x]
- Set up `better-sqlite3` and `drizzle-orm` in the `backend`.
- Define Drizzle schemas (User, Event, EventMember, AttendanceRecord).
- Configure Drizzle Kit for migrations.
- Set up base Express server and tRPC integration.
- Verification: Schema migration successful, basic tRPC "hello" query works.

## Phase 3: Authentication Implementation (TDD) [x]
- Write tests for user registration, password hashing, and JWT generation.
- Implement registration and login.
- Integrate Nodemailer with Ethereal Email for dev verification.
- Implement email verification logic and `me` endpoint.
- Verification: All auth tests pass.

## Phase 4: Events API Core (TDD) [ ]
- Write tests for Event CRUD and join logic.
- Implement Event creation and listing.
- Implement join logic for open and private events.
- Implement organizer management.
- Verification: All event tests pass.

## Phase 5: QR Code & Attendance Implementation (TDD) [ ]
- Write tests for QR token generation and `/scan` logic.
- Implement QR generation utility.
- Implement `/scan` logic (registration check + attendance recording).
- Verification: All attendance tests pass.

## Phase 6: Frontend Foundation & Auth UI [ ]
- Initialize Vite React app in `packages/frontend`.
- Install Tailwind CSS and shadcn/ui.
- Set up tRPC React Query client.
- Implement routing and Auth pages (Login, Register).
- Verification: User can log in/register via UI.

## Phase 7: Events & Attendance UI [ ]
- Build Dashboard and Event Creation UI.
- Build Event Details and Join interactions.
- Implement QR code display for users.
- Implement QR code scanner for organizers.
- Verification: End-to-end flow from event creation to scanning works in browser.

## Phase 8: Dockerization & PWA [ ]
- Add `vite-plugin-pwa` to frontend.
- Write multi-stage `Dockerfile` and `docker-compose.yml`.
- Test deployment using Podman.
- Verification: Container runs successfully in Podman; PWA is installable.
