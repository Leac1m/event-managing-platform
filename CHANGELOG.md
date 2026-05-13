# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-05-13

### Added
- ✅ Complete event management system with public/private events
- ✅ User registration with profile picture upload
- ✅ Automatic image optimization (200x200px, WebP format)
- ✅ Real-time QR code scanning for attendance verification
- ✅ JWT-based authentication and authorization
- ✅ Attendance tracking with timestamps
- ✅ Role-based access control (organizer, creator, attendee)
- ✅ Progressive Web App (PWA) support with offline functionality
- ✅ Service Worker for automatic caching
- ✅ Docker containerization with persistent volume support
- ✅ Database automatic initialization on container startup
- ✅ Comprehensive test suite for authentication and image processing
- ✅ Email verification system
- ✅ Type-safe API with tRPC
- ✅ Responsive UI with Tailwind CSS

### Backend Features
- Express 5.2 server with tRPC integration
- Drizzle ORM with SQLite database
- Multer for multipart file uploads
- Sharp for image processing and optimization
- bcrypt for secure password hashing
- Better-sqlite3 for reliable database operations
- Zod for schema validation

### Frontend Features
- React 19 with TypeScript
- Vite for fast development and builds
- React Router for client-side navigation
- html5-qrcode for camera-based QR scanning
- Tailwind CSS for responsive styling
- tRPC client for type-safe API calls

### Database Features
- Users table with profile URL support
- Events table with status and type tracking
- Event members table for role management
- Attendance records table with timestamp tracking
- Comprehensive schema with foreign key constraints

### Security
- Password hashing with bcrypt (10 salt rounds)
- JWT token-based authentication
- Email verification for new accounts
- File upload validation (MIME type, size)
- SQL injection prevention via parameterized queries
- CORS configuration

### Docker & Deployment
- Multi-stage Dockerfile for optimized image size
- Docker Compose configuration with volume mounts
- Automatic database initialization script
- Environment-based configuration
- Support for Podman and Docker

### Documentation
- Comprehensive README with quick start guide
- Contributing guidelines with coding standards
- Docker setup documentation
- API reference documentation
- Code of Conduct
- Changelog (this file)

### Testing
- Unit tests for authentication utilities
- Profile image validation tests
- Edge case coverage for validation
- Test suite with Vitest

---

## Release Notes Template

For future releases, use this template:

### [X.Y.Z] - YYYY-MM-DD

#### Added
- New features go here
- Feature descriptions
- Highlight what users gain

#### Changed
- Breaking or significant changes
- API modifications
- Dependency updates

#### Fixed
- Bug fixes with issue references
- Performance improvements
- Security patches

#### Deprecated
- Deprecated features/APIs
- Migration paths

#### Removed
- Removed features
- Cleanup items

#### Security
- Security fixes
- Security improvements

---

## Version History

### 1.0.0 (May 13, 2026)
Initial public release with core event management functionality.

- Event creation and management
- User registration with profile photos
- QR code-based attendance tracking
- PWA support
- Docker deployment support

---

## Upgrading

### From Development (Pre-1.0.0)

If you were running the development version, the following changes affect your setup:

1. **Database Initialization**: The app now auto-initializes the database on startup
   - No manual migration needed in containers
   - Local development still requires: `pnpm --filter backend exec drizzle-kit push`

2. **Environment Variables**: New `PROFILE_UPLOAD_DIR` variable
   - Set this to where profile images should be stored
   - Default: `./uploads`

3. **Docker Changes**:
   - Added `docker-entrypoint.sh` for database initialization
   - Changed Dockerfile `CMD` to `ENTRYPOINT`
   - Dockerfile now copies migration files

### Data Migration

If upgrading from a previous version:

1. Backup your existing database
2. Run: `DATABASE_URL=/path/to/old.db pnpm --filter backend exec drizzle-kit push`
3. Verify all data is intact
4. Use new `PROFILE_UPLOAD_DIR` to migrate old files if needed

---

## Future Roadmap

See [docs/roadmap.md](./docs/roadmap.md) for planned features and upcoming releases.

### v1.1.0 (Planned)
- [ ] Email notifications for event updates
- [ ] Event invitations and RSVP system
- [ ] Enhanced reporting and analytics
- [ ] Batch check-in functionality

### v2.0.0 (Planned)
- [ ] Mobile native app (iOS/Android)
- [ ] Real-time websocket updates
- [ ] Advanced event customization
- [ ] Payment integration
- [ ] Multi-language support

---

## How to Report Security Issues

Please email security@eventmanagingplatform.com with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

Do not open public issues for security vulnerabilities.

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on:
- Reporting bugs
- Requesting features
- Submitting pull requests

---

## Support

- 📖 [Documentation](./docs)
- 🐛 [Issues](https://github.com/yourusername/event-managing-platform/issues)
- 💬 [Discussions](https://github.com/yourusername/event-managing-platform/discussions)

---

**[Unreleased]**: Changes since the last release will be listed here
**[1.0.0]**: First stable release
