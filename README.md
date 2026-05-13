# Event Managing Platform

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/yourusername/event-managing-platform)
[![Version](https://img.shields.io/badge/version-1.0.0-blue)](https://github.com/yourusername/event-managing-platform/releases)
[![License](https://img.shields.io/badge/license-ISC-green)](./LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-v22-green)](https://nodejs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

A modern, full-stack event management platform with real-time QR code scanning, attendee verification, and profile management. Built with TypeScript, React, Express, and SQLite.

## About

The Event Managing Platform is a comprehensive solution for organizing, managing, and tracking events. Organizers can create events (public or private), attendees can register and upload profile photos, and real-time QR code scanning enables quick check-in and attendance tracking. The platform supports offline functionality through PWA technology and provides a seamless experience on mobile and desktop devices.

### Primary Use Cases
- **Corporate Events**: Track attendee check-in for conferences and meetings
- **Educational Events**: Manage registration and attendance for workshops and seminars
- **Social Events**: Organize and monitor attendee participation
- **Community Events**: Facilitate easy registration and attendance verification

## Quick Start

### Prerequisites
- Node.js v22+
- pnpm v11+ (or npm/yarn)
- Docker & Docker Compose (optional, for containerized deployment)
- SQLite (included with better-sqlite3)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/event-managing-platform.git
   cd event-managing-platform
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   # Create a .env file or use environment variables
   export JWT_SECRET=your-secret-key-here
   export DATABASE_URL=./sqlite.db
   export PROFILE_UPLOAD_DIR=./uploads
   ```

4. **Initialize the database**
   ```bash
   pnpm --filter backend exec drizzle-kit push --config packages/backend/drizzle.config.ts
   ```

5. **Seed test data (optional)**
   ```bash
   JWT_SECRET=test-key pnpm --filter backend db:seed
   ```

6. **Start the development servers**
   ```bash
   # Terminal 1: Backend
   pnpm --filter backend dev
   
   # Terminal 2: Frontend
   pnpm --filter frontend dev
   ```

   Backend runs on `http://localhost:3001`
   Frontend runs on `http://localhost:5173`

7. **Log in with test credentials**
   ```
   Username: organizer1
   Password: password123
   Email: organizer@example.com
   ```

### Docker Deployment

1. **Build and run with Docker Compose**
   ```bash
   podman compose up --build
   ```
   or
   ```bash
   docker compose up --build
   ```

2. **Access the application**
   ```
   Frontend: http://localhost:3001
   Backend API: http://localhost:3001/api
   ```

For detailed Docker setup and database initialization, see [DOCKER_DATABASE_SETUP.md](./DOCKER_DATABASE_SETUP.md).

## Features

### 🎯 Event Management
- ✅ Create public and private events with customizable details
- ✅ Set event start/end times and locations
- ✅ Support for event descriptions and metadata
- ✅ Event status tracking (draft, published)
- ✅ Private events secured with passcodes

### 👥 User Management
- ✅ User registration with email verification
- ✅ Profile picture upload with automatic optimization
- ✅ User authentication with JWT tokens
- ✅ Role-based access control (organizer, creator, attendee)
- ✅ Profile information management

### 📱 Attendance Tracking
- ✅ Real-time QR code scanning for check-in
- ✅ Manual token entry fallback
- ✅ Attendance records with timestamps
- ✅ Organizer-only access to attendance data
- ✅ Visual confirmation with attendee photos

### 📸 Profile Management
- ✅ Required profile picture upload at registration
- ✅ Automatic image resizing and compression (200x200, WebP, q82)
- ✅ File validation (JPEG/PNG/WebP, max 500KB)
- ✅ Profile photos displayed in scan results
- ✅ Persistent storage with Docker volume support

### 📡 Technology Features
- ✅ Progressive Web App (PWA) with offline support
- ✅ Service Worker caching for fast loading
- ✅ Responsive design for mobile and desktop
- ✅ Real-time QR code scanning
- ✅ Type-safe API with tRPC

### 🔒 Security
- ✅ Password hashing with bcrypt
- ✅ JWT-based authentication
- ✅ Email verification for new accounts
- ✅ SQL injection prevention with parameterized queries
- ✅ File upload validation

## Tech Stack

### Frontend
- **React** 19 - UI framework
- **TypeScript** 6.0 - Type safety
- **Vite** 8 - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** 4 - Styling
- **tRPC Client** 11 - Type-safe API calls
- **html5-qrcode** - QR code scanning
- **Vite PWA Plugin** 1.3 - Progressive Web App support

### Backend
- **Express** 5.2 - HTTP server
- **Node.js** 22 - Runtime
- **TypeScript** 6.0 - Type safety
- **Drizzle ORM** 0.45 - Database ORM
- **SQLite** (better-sqlite3 12.9) - Database
- **tRPC Server** 11 - Type-safe API
- **Multer** 2.0 - File upload handling
- **Sharp** 0.34 - Image processing
- **Zod** 4.4 - Schema validation
- **Bcrypt** 6.0 - Password hashing
- **JWT** 9.0 - Authentication tokens

### Development Tools
- **pnpm** 11 - Package manager
- **Vitest** 4.1 - Test framework
- **Drizzle Kit** 0.31 - Database migrations
- **ESLint** 10.3 - Code linting
- **Prettier** 3.8 - Code formatting
- **TypeScript ESLint** 8.59 - TS linting

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Podman** - Docker alternative (supported)

## Project Structure

```
event-managing-platform/
├── packages/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── index.ts              # Express server entry
│   │   │   ├── trpc/
│   │   │   │   ├── router.ts         # tRPC endpoints
│   │   │   │   └── trpc.ts           # tRPC setup
│   │   │   ├── db/
│   │   │   │   ├── index.ts          # Database connection
│   │   │   │   └── schema/           # Drizzle schema
│   │   │   ├── utils/
│   │   │   │   ├── auth.ts           # Auth utilities
│   │   │   │   ├── profile-image.ts  # Image handling
│   │   │   │   └── email.ts          # Email sending
│   │   │   ├── services/
│   │   │   │   └── registration.ts   # Registration logic
│   │   │   └── tests/
│   │   ├── dist/                     # Compiled output
│   │   ├── drizzle/                  # Migration files
│   │   └── package.json
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── pages/                # Route pages
│   │   │   ├── components/           # Reusable components
│   │   │   ├── lib/
│   │   │   │   └── trpc.ts           # tRPC client setup
│   │   │   └── App.tsx               # Main app component
│   │   ├── dist/                     # Built output
│   │   └── package.json
│   └── ...
├── docs/
│   ├── prd.md                        # Product requirements
│   ├── design-system.md              # Design specs
│   └── roadmap.md                    # Feature roadmap
├── Dockerfile                         # Container build
├── docker-compose.yml                # Docker compose config
├── CONTRIBUTING.md                   # Development guide
├── README.md                         # This file
└── package.json                      # Root package config
```

## Commands

### Development
```bash
# Install dependencies
pnpm install

# Start backend dev server (watches for changes)
pnpm --filter backend dev

# Start frontend dev server (watches for changes)
pnpm --filter frontend dev

# Run all dev servers together
pnpm dev
```

### Database
```bash
# Create a new migration
pnpm --filter backend exec drizzle-kit generate --config packages/backend/drizzle.config.ts

# Apply migrations
pnpm --filter backend exec drizzle-kit migrate --config packages/backend/drizzle.config.ts

# Push schema to database
pnpm --filter backend exec drizzle-kit push --config packages/backend/drizzle.config.ts

# Launch Drizzle Studio GUI
pnpm --filter backend exec drizzle-kit studio --config packages/backend/drizzle.config.ts

# Seed database with test data
JWT_SECRET=your-key pnpm --filter backend db:seed
```

### Building
```bash
# Build everything
pnpm build

# Build backend only
pnpm --filter backend run build

# Build frontend only
pnpm --filter frontend run build
```

### Testing
```bash
# Run tests
pnpm --filter backend test

# Run tests in watch mode
pnpm --filter backend test:watch

# Run tests with UI
pnpm --filter backend test:dev
```

### Docker
```bash
# Build Docker image
podman compose build
# or
docker compose build

# Start containers
podman compose up

# Start in background
podman compose up -d

# View logs
podman compose logs -f

# Stop containers
podman compose down
```

## Environment Variables

Create a `.env` file in the root directory or set these environment variables:

```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=./sqlite.db
PROFILE_UPLOAD_DIR=./uploads

# Authentication
JWT_SECRET=your-super-secret-key-change-in-production

# Email (Optional - required for email verification)
MAILTRAP_TOKEN=your-mailtrap-token
MAILTRAP_ACCOUNT_ID=your-account-id
```

### Important Security Notes
- **JWT_SECRET**: Must be changed in production. Use a strong random string (min 32 chars)
- **Database**: Use a separate database for production
- **Email**: Configure Mailtrap or your email service for production
- **CORS**: Update CORS settings for your domain in production

## API Documentation

### Authentication Endpoints

#### Register with Profile Photo
```bash
POST /api/auth/register
Content-Type: multipart/form-data

Fields:
- username: string (unique, 3+ chars)
- email: string (valid email, unique)
- password: string (min 8 chars)
- gender: 'Male' | 'Female' | 'Other'
- department: string
- firstName: string
- lastName: string
- profileImage: File (JPEG/PNG/WebP, max 500KB) [REQUIRED]
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}

Response:
{
  "token": "jwt-token",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "profileUrl": "string",
    "firstName": "string",
    "lastName": "string"
  }
}
```

### Event Endpoints (via tRPC)

All tRPC endpoints are type-safe and called from the frontend using the tRPC client:

```typescript
import { trpc } from './lib/trpc';

// Create event
await trpc.createEvent.mutate({
  name: 'Tech Conference',
  description: 'A great conference',
  location: 'Downtown Center',
  startTime: new Date(),
  endTime: new Date(),
  type: 'open'
});

// Get events
const events = await trpc.getEvents.query();

// Scan QR code
await trpc.scanQR.mutate({
  eventId: 'event-123',
  token: 'qr-token-from-scanner'
});
```

For complete API documentation, see [docs/API.md](./docs/API.md).

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on:
- Setting up the development environment
- Code standards and conventions
- Submitting pull requests
- Reporting issues

## License

This project is licensed under the ISC License - see the [LICENSE](./LICENSE) file for details.

## Support

- 📖 Documentation: Check the `/docs` folder
- 🐛 Found a bug? Open an [Issue](https://github.com/yourusername/event-managing-platform/issues)
- 💡 Have a feature idea? Start a [Discussion](https://github.com/yourusername/event-managing-platform/discussions)

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for release notes and version history.

## Code of Conduct

Please read our [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) to understand our community standards.

---

**Made with ❤️ by the Event Managing Platform team**
