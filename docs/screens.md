# Screen Inventory & Functions
**Event Hosting Platform · Pulse**

> 18 screens across 4 flows. Each entry covers purpose, visible roles, UI elements, user actions, and API calls consumed.

---

## Screen Map

```
UNAUTHENTICATED
├── S-01  Welcome
├── S-02  Sign Up
├── S-03  Email Verification Pending
└── S-04  Login

MAIN APP — DISCOVERY & EVENTS
├── S-05  Dashboard (Discover)
├── S-06  My Events
├── S-07  Event Detail (Attendee View)
└── S-08  Join Private Event (Passcode)

PROFILE
├── S-09  My QR Code
├── S-10  Profile
└── S-11  Edit Profile

CREATOR / ORGANIZER
├── S-12  Create Event
├── S-13  Edit Event
├── S-14  Event Management (Control Panel)
├── S-15  Manage Organizers
├── S-16  QR Scanner
├── S-17  Scan Result
└── S-18  Attendance List
```

---

## Flow Diagrams

```
ONBOARDING
  S-01 Welcome ──────────────┬──→ S-02 Sign Up ──→ S-03 Verification Pending
                             └──→ S-04 Login ─────────────────────────────────→ S-05 Dashboard

DISCOVERY
  S-05 Dashboard ──→ S-07 Event Detail ──┬──→ [Join Open]   → S-06 My Events
                                         └──→ S-08 Passcode  → S-06 My Events
  S-05 Dashboard ──→ S-12 Create Event   ──→ S-14 Management

ORGANIZER FLOW
  S-14 Management ──┬──→ S-15 Manage Organizers
                    ├──→ S-16 QR Scanner ──→ S-17 Scan Result
                    ├──→ S-18 Attendance List
                    └──→ S-13 Edit Event

PROFILE
  Any screen → S-10 Profile → S-11 Edit Profile
  S-10 Profile → S-09 My QR Code
```

---

## S-01 · Welcome

**Role:** Unauthenticated visitor
**Entry point:** App root `/`

### Purpose
First screen anyone sees. Sets the visual tone of the platform and directs users to either create an account or log in. No content is visible without authentication.

### Layout
```
┌────────────────────────────────┐
│                                │
│        [Platform logo]         │
│           PULSE                │
│   Event platform · Tech Hub   │
│                                │
│                                │
│   ┌──────────────────────┐     │
│   │   Create Account     │     │  ← Primary button
│   └──────────────────────┘     │
│                                │
│   ┌──────────────────────┐     │
│   │       Log In         │     │  ← Secondary button
│   └──────────────────────┘     │
│                                │
└────────────────────────────────┘
```

### Actions
- **Create Account** → navigates to S-02
- **Log In** → navigates to S-04

### Notes
- No API calls on this screen
- If a valid JWT is already stored, redirect directly to S-05 (skip this screen)

---

## S-02 · Sign Up

**Role:** Unauthenticated visitor
**Route:** `/register`

### Purpose
Collects all required user information to create an account. On submission, the backend creates the user record and dispatches a verification email.

### Layout
```
┌────────────────────────────────┐
│  ←   Create your account       │
│                                │
│  [Profile photo upload]        │
│                                │
│  First name       Last name    │
│  [──────────────] [──────────] │
│                                │
│  Username                      │
│  [────────────────────────]    │
│                                │
│  Email                         │
│  [────────────────────────]    │
│                                │
│  Password                      │
│  [────────────────────────]    │
│                                │
│  Matric Number                 │
│  [────────────────────────]    │
│                                │
│  Department                    │
│  [────────────── ▾]            │  ← Select/dropdown
│                                │
│  Gender                        │
│  ◉ Male   ○ Female             │
│                                │
│  Phone number (optional)       │
│  [────────────────────────]    │
│                                │
│  ┌──────────────────────────┐  │
│  │    Create Account        │  │  ← Primary button
│  └──────────────────────────┘  │
│                                │
│  Already have an account?      │
│  Log in                        │
│                                │
└────────────────────────────────┘
```

### Actions
- **Submit form** → `POST /api/auth/register` → on success, navigate to S-03
- **Log in** link → navigate to S-04
- **Upload photo** → file picker; preview inline before submit

### Validation (inline, on blur)
| Field | Rule |
|---|---|
| Username | Alphanumeric + underscores, 3–20 chars, unique |
| Email | Valid format, unique |
| Password | Min 8 chars, at least one number |
| Matric number | Optional but unique if provided |

### API
- `POST /api/auth/register`

---

## S-03 · Email Verification Pending

**Role:** Newly registered user (unverified)
**Route:** `/verify-email`

### Purpose
Holds the user after registration and prompts them to check their inbox. The user cannot access any other screen until their email is verified. The backend link in the email calls `GET /api/auth/verify-email?token=...` and then redirects back to the app.

### Layout
```
┌────────────────────────────────┐
│                                │
│         ✉  [envelope icon]    │
│                                │
│   Check your inbox             │
│                                │
│   We sent a verification link  │
│   to jane@example.com          │
│                                │
│   Click the link in that email │
│   to activate your account.    │
│                                │
│   ─────────────────────────    │
│                                │
│   Didn't receive it?           │
│   ┌──────────────────────┐     │
│   │  Resend verification │     │  ← Secondary button, rate-limited 60s
│   └──────────────────────┘     │
│                                │
│   Wrong email? Sign up again   │  ← navigates back to S-02
│                                │
└────────────────────────────────┘
```

### Actions
- **Resend verification** → `POST /api/auth/resend-verification`; button disabled for 60s after tap
- **Sign up again** → clears state, navigate to S-02
- Email link in inbox → `GET /api/auth/verify-email?token=...` → redirect to S-04 with success toast

### Notes
- Polling or a WebSocket can optionally detect verification in the background and auto-redirect to S-04

---

## S-04 · Login

**Role:** Verified, returning user
**Route:** `/login`

### Purpose
Authenticates an existing user and issues a JWT stored in `localStorage`. Redirects to S-05 on success.

### Layout
```
┌────────────────────────────────┐
│  ←   Welcome back              │
│                                │
│  Email                         │
│  [────────────────────────]    │
│                                │
│  Password                      │
│  [──────────────────── 👁]     │  ← show/hide toggle
│                                │
│  ┌──────────────────────────┐  │
│  │         Log In           │  │
│  └──────────────────────────┘  │
│                                │
│  Don't have an account?        │
│  Sign up                       │
│                                │
└────────────────────────────────┘
```

### Actions
- **Submit** → `POST /api/auth/login` → store JWT → navigate to S-05
- **Sign up** → navigate to S-02

### Error States
- Invalid credentials → inline error below password field
- Unverified email → show banner with resend link

### API
- `POST /api/auth/login`

---

## S-05 · Dashboard — Discover

**Role:** All authenticated users
**Route:** `/`

### Purpose
The primary landing screen after login. Shows all published events on the platform. Serves as the main discovery surface — users see what's happening and can browse or search events before deciding to join.

### Layout
```
┌─────────────────────────────────────────────┐
│  SIDEBAR        │  MAIN                      │
│                 │                            │
│  [Avatar]       │  Good evening, Jane  👋    │
│  Jane Doe       │                            │
│  @janedoe       │  [🔍 Search events...]     │
│                 │                            │
│  ──────────     │  ─── UPCOMING ─────────── │
│                 │                            │
│  🏠 Discover    │  ┌──────────┐ ┌──────────┐ │
│  📅 My Events   │  │ [badge]  │ │ [badge]  │ │
│  👤 Profile     │  │          │ │          │ │
│  ──────────     │  │ Event A  │ │ Event B  │ │
│                 │  │ Nov 12   │ │ Nov 14   │ │
│  + Create       │  │ 📍 Hall B│ │ 📍 Room 3│ │
│    Event        │  │ 👥 42    │ │ 👥 18    │ │
│                 │  └──────────┘ └──────────┘ │
│                 │                            │
│                 │  ─── ALL EVENTS ─────────  │
│                 │                            │
│                 │  ┌────────────────────┐    │
│                 │  │ Event C    🔒Private│    │
│                 │  │ Dec 1 · Hall A      │    │
│                 │  │ 👥 60               │    │
│                 │  └────────────────────┘    │
│                 │                            │
│                 │  ┌────────────────────┐    │
│                 │  │ Event D    🌐 Open  │    │
│                 │  │ Dec 3 · Auditorium  │    │
│                 │  └────────────────────┘    │
└─────────────────────────────────────────────┘
```

### UI Elements
- **Sidebar** — avatar, name, username, nav links, "Create Event" shortcut
- **Greeting** — personalised with time of day
- **Search bar** — filters event list client-side by name or location
- **Upcoming section** — horizontal scroll card row; events starting within 7 days
- **All Events section** — vertical list; all published events not in the upcoming row
- **Event cards** — show name, type badge (open/private/live), date, location, attendee count

### Actions
- Click any event card → navigate to S-07 (Event Detail)
- Click **Create Event** → navigate to S-12
- Click **My Events** in sidebar → navigate to S-06
- Click **Profile** → navigate to S-10

### API
- `GET /api/events` — fetches all published events

---

## S-06 · My Events

**Role:** All authenticated users
**Route:** `/my-events`

### Purpose
Focused view of only the events a user is involved in — as an attendee, organizer, or creator. Gives a quick at-a-glance state of all personal event commitments.

### Layout
```
┌──────────────────────────────────────┐
│  SIDEBAR  │  My Events               │
│           │                          │
│           │  [Tabs]                  │
│           │  All │ Attending│Managing│
│           │                          │
│           │  ┌──────────────────┐    │
│           │  │ [creator badge]  │    │
│           │  │ Hackathon Night  │    │  ← created by me
│           │  │ Nov 20 · Draft   │    │
│           │  │ [Manage →]       │    │
│           │  └──────────────────┘    │
│           │                          │
│           │  ┌──────────────────┐    │
│           │  │ [organizer badge]│    │
│           │  │ Dev Bootcamp     │    │  ← I'm an organizer
│           │  │ Nov 15 · Live    │    │
│           │  │ [Manage →]       │    │
│           │  └──────────────────┘    │
│           │                          │
│           │  ┌──────────────────┐    │
│           │  │ [attendee badge] │    │
│           │  │ UI/UX Workshop   │    │  ← I joined
│           │  │ Dec 3 · Published│    │
│           │  │ [View →]         │    │
│           │  └──────────────────┘    │
└──────────────────────────────────────┘
```

### Tabs
| Tab | Shows |
|---|---|
| All | Every event the user is connected to |
| Attending | Events where role = `attendee` |
| Managing | Events where role = `creator` or `organizer` |

### Actions
- Click attendee event card → navigate to S-07 (Event Detail)
- Click creator/organizer event card → navigate to S-14 (Management)
- **Manage →** shortcut → S-14

### API
- `GET /api/events/my`

---

## S-07 · Event Detail (Attendee View)

**Role:** All authenticated users
**Route:** `/events/:id`

### Purpose
Full details of a single event. For users who haven't joined, this is the conversion screen — they decide to join here. For users already registered, it confirms their status and provides the QR code access point.

### Layout
```
┌──────────────────────────────────────┐
│  ←  Back                            │
│                                      │
│  [Open badge]       [Nov 20, 2025]   │
│                                      │
│  Hackathon Night                     │  ← Syne 700, large
│                                      │
│  📍 Innovation Hall · Building C     │
│  🕐 6:00 PM → 10:00 PM              │
│                                      │
│  ──────────────────────────────      │
│                                      │
│  About                               │
│  A 4-hour collaborative hackathon    │
│  open to all departments...          │
│                                      │
│  ──────────────────────────────      │
│                                      │
│  Organizers                          │
│  [Avatar] [Avatar]  + 1 more         │
│                                      │
│  Attendees  ·  42 registered         │
│  [Avatar] [Avatar] [Avatar]  +39     │
│                                      │
│  ──────────────────────────────      │
│                                      │
│  ┌────────────────────────────┐      │
│  │       Join Event           │      │  ← shown if not joined
│  └────────────────────────────┘      │
│                                      │
│  ✅ You're registered                 │  ← shown if joined
│  [View my QR code]                   │
│                                      │
└──────────────────────────────────────┘
```

### States
| State | CTA shown |
|---|---|
| Not joined, open event | "Join Event" primary button |
| Not joined, private event | "Enter Passcode" primary button → S-08 |
| Already joined | "✅ You're registered" + "View my QR Code" link → S-09 |
| Creator/organizer | "Manage Event" button → S-14 |

### Actions
- **Join Event (open)** → `POST /api/events/:id/join` → refresh page with registered state
- **Enter Passcode (private)** → open S-08 as a modal
- **View my QR Code** → navigate to S-09
- **Manage Event** → navigate to S-14

### API
- `GET /api/events/:id`
- `POST /api/events/:id/join`

---

## S-08 · Join Private Event — Passcode

**Role:** Authenticated users, not yet a member of a private event
**Trigger:** Modal opened from S-07

### Purpose
A focused, minimal modal that accepts the event's static passcode. Keeps the join flow fast — no separate page navigation needed.

### Layout
```
┌───────────────────────────┐
│  🔒  Join Private Event   │  ← modal, overlays S-07
│                           │
│  Enter the event passcode │
│  provided by the organizer│
│                           │
│  [──────────────────────] │  ← passcode input, monospaced font
│                           │
│  ┌─────────────────────┐  │
│  │       Join          │  │
│  └─────────────────────┘  │
│                           │
│       Cancel              │
└───────────────────────────┘
```

### Actions
- **Join** → `POST /api/events/:id/join-private` with passcode payload
  - Success → close modal, S-07 updates to "You're registered" state
  - Failure → inline error "Incorrect passcode"
- **Cancel** → close modal, return to S-07

### API
- `POST /api/events/:id/join-private`

---

## S-09 · My QR Code

**Role:** Authenticated users registered for at least one event
**Route:** `/me/qr`

### Purpose
Displays the user's personal QR code, which encodes an opaque token tied to their account. Shown to an organizer's scanner (S-16) to verify identity and log attendance. This screen is intentionally minimal — it should be readable fast, in any lighting.

### Layout
```
┌────────────────────────────────┐
│  ←  My QR Code                │
│                                │
│                                │
│   ┌────────────────────────┐   │
│   │                        │   │
│   │    ██ ██ ███ ██ ██     │   │
│   │    ██    ███    ██     │   │
│   │    ████████████████    │   │  ← QR code, large, high contrast
│   │    ██    ███    ██     │   │
│   │    ██ ██ ███ ██ ██     │   │
│   │                        │   │
│   └────────────────────────┘   │
│                                │
│   Jane Doe                     │
│   @janedoe · CSC Dept          │
│                                │
│   ──────────────────────────   │
│                                │
│   Show this to an organizer    │
│   to verify your attendance    │
│                                │
│   Token: a3f9...c12e           │  ← mono font, truncated
│                                │
│   ┌──────────────────────┐     │
│   │   🔄  Refresh Token  │     │  ← regenerates opaque token
│   └──────────────────────┘     │
│                                │
└────────────────────────────────┘
```

### Actions
- **Refresh Token** → `GET /api/users/me/qr` → re-renders QR with new token
- Screen brightness automatically maximised on mount (PWA capability)
- QR rotates by default every 5 minutes for basic freshness (no auth security requirement since there's no rate limit)

### API
- `GET /api/users/me/qr`

---

## S-10 · Profile

**Role:** Authenticated user (own profile)
**Route:** `/profile`

### Purpose
Read-only view of the current user's information. Entry point to editing and to the QR code screen.

### Layout
```
┌────────────────────────────────┐
│  SIDEBAR  │  Profile           │
│           │                    │
│           │  [Avatar · 80px]   │
│           │  Jane Doe          │  ← Syne 700
│           │  @janedoe          │  ← secondary text
│           │                    │
│           │  ┌──────────────┐  │
│           │  │  Edit Profile│  │  ← secondary button → S-11
│           │  └──────────────┘  │
│           │  ┌──────────────┐  │
│           │  │  My QR Code  │  │  ← ghost button → S-09
│           │  └──────────────┘  │
│           │                    │
│           │  ─ Details ──────  │
│           │                    │
│           │  Email             │
│           │  jane@example.com  │
│           │                    │
│           │  Department        │
│           │  Computer Science  │
│           │                    │
│           │  Matric Number     │
│           │  CSC/2021/001      │
│           │                    │
│           │  Gender            │
│           │  Female            │
│           │                    │
│           │  Phone             │
│           │  +234 800 000 0000 │
│           │                    │
│           │  ───────────────   │
│           │                    │
│           │  [Log Out]         │  ← danger/ghost
│           │                    │
└────────────────────────────────┘
```

### Actions
- **Edit Profile** → navigate to S-11
- **My QR Code** → navigate to S-09
- **Log Out** → `POST /api/auth/logout` → clear JWT → navigate to S-01

### API
- `GET /api/users/me` (data already in JWT; can be used as cache)
- `POST /api/auth/logout`

---

## S-11 · Edit Profile

**Role:** Authenticated user
**Route:** `/profile/edit`

### Purpose
Allows users to update mutable profile fields. Username and email require uniqueness checks. Profile photo can be re-uploaded.

### Layout
```
┌────────────────────────────────┐
│  ←  Edit Profile               │
│                                │
│  [Avatar · 80px]  [Change →]  │
│                                │
│  First name       Last name    │
│  [────────────] [────────────] │
│                                │
│  Username                      │
│  [──────────────────────────]  │
│                                │
│  Phone number                  │
│  [──────────────────────────]  │
│                                │
│  ── Read-only fields ────────  │
│  Email · Matric · Department   │  ← greyed out; not editable
│  Contact admin to change these.│
│                                │
│  ┌──────────────────────────┐  │
│  │      Save Changes        │  │
│  └──────────────────────────┘  │
│                                │
└────────────────────────────────┘
```

### Editable vs Locked Fields

| Field | Editable |
|---|---|
| Profile photo | ✅ |
| First / Last name | ✅ |
| Username | ✅ (unique check) |
| Phone number | ✅ |
| Email | ❌ (contact admin) |
| Matric number | ❌ |
| Department | ❌ |
| Gender | ❌ |

### Actions
- **Save Changes** → `PATCH /api/users/me` → success toast → navigate back to S-10

### API
- `PATCH /api/users/me`

---

## S-12 · Create Event

**Role:** Any authenticated user
**Route:** `/events/create`

### Purpose
Multi-step form that collects all details required to create an event. Saves as a draft by default; the creator explicitly publishes from S-14.

### Layout — Step 1: Basics
```
┌────────────────────────────────┐
│  ←  Create Event      1 of 2   │
│                                │
│  Event name                    │
│  [──────────────────────────]  │
│                                │
│  Description                   │
│  [──────────────────────────]  │
│  [   multiline textarea     ]  │
│  [──────────────────────────]  │
│                                │
│  Location (optional)           │
│  [──────────────────────────]  │
│                                │
│  Start date & time             │
│  [────────────] [────────────] │
│                                │
│  End date & time               │
│  [────────────] [────────────] │
│                                │
│         [Continue →]           │
└────────────────────────────────┘
```

### Layout — Step 2: Access
```
┌────────────────────────────────┐
│  ←  Create Event      2 of 2   │
│                                │
│  Event type                    │
│                                │
│  ┌─────────────┐ ┌───────────┐ │
│  │  🌐  Open   │ │ 🔒 Private│ │  ← toggle cards
│  │  Anyone can │ │ Passcode  │ │
│  │  join       │ │ required  │ │
│  └─────────────┘ └───────────┘ │
│                                │
│  [If Private selected:]        │
│  Passcode                      │
│  [──────────────────────────]  │
│  Attendees will enter this to  │
│  join.                         │
│                                │
│  ┌──────────────────────────┐  │
│  │    Create as Draft       │  │  ← primary button
│  └──────────────────────────┘  │
│                                │
└────────────────────────────────┘
```

### Actions
- **Continue** (step 1 → 2) → client-side only, validates step 1 fields
- **Create as Draft** → `POST /api/events` with `status: "draft"` → navigate to S-14

### API
- `POST /api/events`

---

## S-13 · Edit Event

**Role:** Creator, Organizer
**Route:** `/events/:id/edit`

### Purpose
Same form as S-12, pre-populated with existing event data. Allows all fields to be updated, including switching event type and resetting the passcode. Only accessible while the event is in `draft` status or before it starts.

### Layout
Identical to S-12 but pre-filled. Additional element at the bottom:

```
│  ─────────────────────────   │
│                              │
│  Danger zone                 │
│  ┌──────────────────────┐    │
│  │   Delete this event  │    │  ← danger button; confirm modal before DELETE
│  └──────────────────────┘    │
```

### Actions
- **Save Changes** → `PATCH /api/events/:id` → success toast → navigate to S-14
- **Delete Event** → confirmation modal → `DELETE /api/events/:id` → navigate to S-06

### API
- `GET /api/events/:id` (pre-populate)
- `PATCH /api/events/:id`
- `DELETE /api/events/:id`

---

## S-14 · Event Management — Control Panel

**Role:** Creator, Organizer
**Route:** `/events/:id/manage`

### Purpose
The operational home base for everyone managing an event. Surfaces key stats, gives access to all management sub-actions, and is the launchpad for the QR scanner. This is the screen organizers will have open on their devices during the event.

### Layout
```
┌────────────────────────────────────────────────┐
│  ←  Hackathon Night         [Published badge]  │
│                                                │
│  Nov 20 · 6:00 PM – 10:00 PM · Innovation Hall │
│                                                │
│  ─ At a Glance ──────────────────────────────  │
│                                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │    42    │  │    17    │  │   58 mins    │ │
│  │Registered│  │ Attended │  │  Until start │ │
│  └──────────┘  └──────────┘  └──────────────┘ │
│                                                │
│  ─ Actions ──────────────────────────────────  │
│                                                │
│  ┌───────────────────────────────────────────┐ │
│  │  📷  Open QR Scanner                →    │ │  → S-16
│  └───────────────────────────────────────────┘ │
│                                                │
│  ┌───────────────────────────────────────────┐ │
│  │  👥  Attendance List                →    │ │  → S-18
│  └───────────────────────────────────────────┘ │
│                                                │
│  ┌───────────────────────────────────────────┐ │
│  │  🛡  Manage Organizers              →    │ │  → S-15
│  └───────────────────────────────────────────┘ │
│                                                │
│  ┌───────────────────────────────────────────┐ │
│  │  ✏️  Edit Event                     →    │ │  → S-13
│  └───────────────────────────────────────────┘ │
│                                                │
│  ─ Publish ──────────────────────────────────  │
│                                                │
│  [Only shown if status = "draft"]              │
│  ┌───────────────────────────────────────────┐ │
│  │  🚀  Publish Event                        │ │
│  └───────────────────────────────────────────┘ │
│                                                │
└────────────────────────────────────────────────┘
```

### Stats Cards
| Stat | Source |
|---|---|
| Registered | Count of `EventMember` rows for this event |
| Attended | Count of `AttendanceRecord` rows for this event |
| Time until start | Derived from `start_time` |

### Actions
- **Open QR Scanner** → navigate to S-16
- **Attendance List** → navigate to S-18
- **Manage Organizers** → navigate to S-15
- **Edit Event** → navigate to S-13
- **Publish Event** → `POST /api/events/:id/publish` → badge updates to "Published"

### API
- `GET /api/events/:id`
- `POST /api/events/:id/publish`

---

## S-15 · Manage Organizers

**Role:** Creator only
**Route:** `/events/:id/organizers`

### Purpose
Allows the creator to build their organizing team. Organizers are added by providing both username and email (double verification prevents typos). Organizers can be removed at any time.

### Layout
```
┌────────────────────────────────┐
│  ←  Manage Organizers          │
│     Hackathon Night            │
│                                │
│  ─ Add Organizer ───────────   │
│                                │
│  Username                      │
│  [──────────────────────────]  │
│                                │
│  Email                         │
│  [──────────────────────────]  │
│                                │
│  ┌──────────────────────────┐  │
│  │      Add Organizer       │  │
│  └──────────────────────────┘  │
│                                │
│  ─ Current Organizers ──────   │
│                                │
│  [Avatar] John Smith           │
│  @johnsmith · CSC              │
│  Added Nov 10                  [Remove]
│                                │
│  [Avatar] Ada James            │
│  @adajames · EEE               │
│  Added Nov 11                  [Remove]
│                                │
└────────────────────────────────┘
```

### Actions
- **Add Organizer** → `POST /api/events/:id/organizers` with `{ username, email }`
  - Error if username + email don't match a single user record
  - Error if user is already an organizer
- **Remove** → `DELETE /api/events/:id/organizers/:userId` → updates list

### API
- `POST /api/events/:id/organizers`
- `DELETE /api/events/:id/organizers/:userId`

---

## S-16 · QR Scanner

**Role:** Creator, Organizer
**Route:** `/events/:id/scan`

### Purpose
Full-screen camera view used during the event to scan attendees' QR codes (S-09). The camera reads the opaque token, sends it to the backend, and receives the attendee's details if they are registered. This is the most time-critical screen — it must be instant and work reliably in a busy indoor space.

### Layout
```
┌────────────────────────────────┐
│                          [✕]  │  ← close → S-14
│                                │
│                                │
│   ╔══════════════════════╗     │
│   ║                      ║     │
│   ║    [camera feed]     ║     │
│   ║                      ║     │
│   ║  ┌──────────────┐   ║     │
│   ║  │              │   ║     │
│   ║  │   viewfinder │   ║     │  ← scanning reticle with corner brackets
│   ║  │              │   ║     │
│   ║  └──────────────┘   ║     │
│   ║                      ║     │
│   ╚══════════════════════╝     │
│                                │
│   Point camera at attendee's   │
│   QR code                      │
│                                │
│   Hackathon Night · Nov 20     │  ← event context always visible
│                                │
└────────────────────────────────┘
```

### Scan Flow
```
QR detected
     │
     ▼
POST /api/events/:id/attendance/scan  { token }
     │
     ├─ 200 OK + user data ──→ viewfinder flashes green
     │                          S-17 slides up as bottom sheet
     │
     ├─ 404 Not registered ──→ viewfinder flashes red
     │                          Toast: "Not registered for this event"
     │                          Scanner resumes automatically after 2s
     │
     └─ 409 Already scanned ─→ viewfinder flashes amber
                               Toast: "Already checked in at [time]"
                               Scanner resumes automatically after 2s
```

### Notes
- Camera permission prompt handled on first open
- Scanner pauses while result is displayed; resumes after dismissal
- "Already scanned" is a non-blocking warning — the organizer decides how to handle it

### API
- `POST /api/events/:id/attendance/scan`

---

## S-17 · Scan Result

**Role:** Creator, Organizer
**Trigger:** Bottom sheet slides up over S-16 after a successful scan

### Purpose
Shows the organizer the verified identity details of the scanned attendee. Confirms check-in. The organizer dismisses this to continue scanning the next person.

### Layout
```
┌────────────────────────────────┐  ▲
│  ✅  Checked In                │  │  bottom sheet,
│                                │  │  slides up from
│  [Avatar · 56px]               │  │  bottom of S-16
│  Jane Doe                      │  │
│  @janedoe                      │  │
│                                │  │
│  Department    Computer Science│  │
│  Matric No.    CSC/2021/001    │  │
│                                │  │
│  Scanned at 6:43 PM            │  │
│                                │  │
│  ┌──────────────────────────┐  │  │
│  │  Done — Scan Next Person │  │  │  ← dismisses sheet, scanner resumes
│  └──────────────────────────┘  │  │
└────────────────────────────────┘  │
```

### Actions
- **Done — Scan Next Person** → close sheet → S-16 resumes scanning
- Tapping outside the sheet → same as above

### Notes
- No additional API call needed — data is returned in the S-16 scan response
- Sheet auto-dismisses after 10 seconds if the organizer doesn't interact with it

---

## S-18 · Attendance List

**Role:** Creator, Organizer
**Route:** `/events/:id/attendance`

### Purpose
A full record of every check-in for the event. Useful for reviewing attendance mid-event or generating a post-event report. Shows who attended, when they were scanned, and who scanned them.

### Layout
```
┌──────────────────────────────────────┐
│  ←  Attendance · Hackathon Night     │
│                                      │
│  17 checked in  ·  42 registered     │
│  [━━━━━━━━━━━━━━░░░░░░░░░]  40%      │  ← progress bar
│                                      │
│  [🔍 Search by name...]              │
│                                      │
│  ┌──────────────────────────────┐    │
│  │ [Avatar] Jane Doe            │    │
│  │ @janedoe · CSC               │    │
│  │ Checked in 6:43 PM           │    │
│  │ Scanned by @johnsmith        │    │
│  └──────────────────────────────┘    │
│                                      │
│  ┌──────────────────────────────┐    │
│  │ [Avatar] Ade Bello           │    │
│  │ @adebello · EEE              │    │
│  │ Checked in 6:51 PM           │    │
│  │ Scanned by @adajames         │    │
│  └──────────────────────────────┘    │
│                                      │
│  · · ·                               │
│                                      │
└──────────────────────────────────────┘
```

### UI Elements
- **Summary bar** — registered count, attended count, attendance percentage progress bar
- **Search** — filters list client-side by name or username
- **Attendance rows** — avatar, full name, username, department, check-in time, scanned-by username
- Rows sorted by `scanned_at` descending (most recent first)

### Actions
- Search filters the list locally — no additional API call
- Pull-to-refresh fetches latest data

### API
- `GET /api/events/:id/attendance`

---

## Screen Summary Table

| ID | Screen | Route | Roles | Primary API |
|---|---|---|---|---|
| S-01 | Welcome | `/welcome` | — | — |
| S-02 | Sign Up | `/register` | — | `POST /auth/register` |
| S-03 | Email Verification Pending | `/verify-email` | Unverified | `POST /auth/resend-verification` |
| S-04 | Login | `/login` | — | `POST /auth/login` |
| S-05 | Dashboard — Discover | `/` | All | `GET /events` |
| S-06 | My Events | `/my-events` | All | `GET /events/my` |
| S-07 | Event Detail | `/events/:id` | All | `GET /events/:id` |
| S-08 | Join Private Event | Modal | All | `POST /events/:id/join-private` |
| S-09 | My QR Code | `/me/qr` | All | `GET /users/me/qr` |
| S-10 | Profile | `/profile` | All | `GET /users/me` |
| S-11 | Edit Profile | `/profile/edit` | All | `PATCH /users/me` |
| S-12 | Create Event | `/events/create` | All | `POST /events` |
| S-13 | Edit Event | `/events/:id/edit` | Creator, Organizer | `PATCH /events/:id` |
| S-14 | Event Management | `/events/:id/manage` | Creator, Organizer | `GET /events/:id` |
| S-15 | Manage Organizers | `/events/:id/organizers` | Creator | `POST/DELETE /events/:id/organizers` |
| S-16 | QR Scanner | `/events/:id/scan` | Creator, Organizer | `POST /events/:id/attendance/scan` |
| S-17 | Scan Result | — (sheet over S-16) | Creator, Organizer | — |
| S-18 | Attendance List | `/events/:id/attendance` | Creator, Organizer | `GET /events/:id/attendance` |
