# Event Management Platform

## Description

An event creation and management platform that supports open and private events, QR-based identity verification, and attendance tracking.

---

## User Stories

### Authentication
- User creates an account (email verification required before access is granted)
- User logs in to their account

### Events
- User views a dashboard showing all available events alongside events they have joined or created
- User joins an open event by clicking on it
- User joins a private event by entering a static passcode
- User creates an event by filling in the required details (name, description, date/time, type, etc.)

### Identity Verification & Attendance
- Organizers may require attendees to verify their identity via QR code scanning
- A user's details are only revealed during a scan if they are registered for that specific event
- Successful scans are recorded as attendance entries

### Information Shown to Organizers on Scan
- Profile photo
- Full name
- Username
- Department
- Matric number

---

## Data Schema

### User
| Field | Type | Constraints |
|---|---|---|
| `id` | UUID | Primary key |
| `username` | String | Unique, required |
| `email` | String | Unique, required |
| `password_hash` | String | Required |
| `email_verified` | Boolean | Default: false |
| `profile_url` | String | Nullable |
| `first_name` | String | Required |
| `last_name` | String | Required |
| `gender` | `"Male"` \| `"Female"` | Required |
| `matric_number` | String | Unique, nullable |
| `department` | String | Required |
| `phone_number` | String | Nullable |
| `created_at` | Timestamp | Auto |

### Event
| Field | Type | Constraints |
|---|---|---|
| `id` | UUID | Primary key |
| `name` | String | Required |
| `description` | String | Required |
| `location` | String | Nullable |
| `start_time` | Timestamp | Required |
| `end_time` | Timestamp | Required |
| `type` | `"open"` \| `"private"` | Required |
| `passcode` | String | Required if type is `"private"` |
| `status` | `"draft"` \| `"published"` | Default: `"draft"` |
| `created_at` | Timestamp | Auto |

### EventMember (join table)
| Field | Type | Constraints |
|---|---|---|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK → User |
| `event_id` | UUID | FK → Event |
| `role` | `"creator"` \| `"organizer"` \| `"attendee"` | Required |
| `joined_at` | Timestamp | Auto |

### AttendanceRecord
| Field | Type | Constraints |
|---|---|---|
| `id` | UUID | Primary key |
| `event_id` | UUID | FK → Event |
| `user_id` | UUID | FK → User |
| `scanned_by` | UUID | FK → User (organizer) |
| `scanned_at` | Timestamp | Auto |

---

## API Endpoints

### Auth — `/api/auth`
| Method | Path | Description |
|---|---|---|
| `POST` | `/register` | Create account (sends verification email) |
| `GET` | `/verify-email?token=` | Verify email address |
| `POST` | `/login` | Log in, returns session/JWT |
| `POST` | `/logout` | Invalidate session |
| `POST` | `/resend-verification` | Resend verification email |

### Users — `/api/users`
| Method | Path | Description |
|---|---|---|
| `GET` | `/me` | Get current user profile |
| `PATCH` | `/me` | Update profile |
| `GET` | `/me/qr` | Generate QR code for the current user |

### Events — `/api/events`
| Method | Path | Description |
|---|---|---|
| `GET` | `/` | List all published events |
| `GET` | `/my` | List events the current user belongs to |
| `GET` | `/:id` | Get event details |
| `POST` | `/` | Create a new event |
| `PATCH` | `/:id` | Update event (creator/organizer only) |
| `DELETE` | `/:id` | Delete event (creator only) |
| `POST` | `/:id/join` | Join an open event |
| `POST` | `/:id/join-private` | Join a private event with passcode |
| `POST` | `/:id/publish` | Publish a draft event |
| `POST` | `/:id/organizers` | Add an organizer by username + email (creator only) |
| `DELETE` | `/:id/organizers/:userId` | Remove an organizer (creator only) |

### Attendance — `/api/events/:id/attendance`
| Method | Path | Description |
|---|---|---|
| `POST` | `/scan` | Scan a user's QR code; returns user details if registered |
| `GET` | `/` | Get attendance list for an event (organizer only) |

---

## Tech Stack

> To be built and deployed as a container.

### Frontend
- **React** (Web + PWA)
  - TypeScript
  - Tailwind CSS
  - shadcn/ui

### Backend
- **Node.js**
  - TypeScript
  - Express
  - tRPC
  - Drizzle ORM
  - Nodemailer (email verification)

### Database
- **better-sqlite3** — mounted as a persistent Docker volume

---

## Design Decisions

| Concern | Decision |
|---|---|
| QR code payload | Opaque token (server-side lookup on scan) |
| Auth strategy | JWT |
| Email delivery | Nodemailer (self-hosted, via Node.js backend) |
| `/scan` rate limiting | Not required for now |
| Organizer role assignment | Creator adds organizers by supplying their username + email; organizers share creator-level privileges |
