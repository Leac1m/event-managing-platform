# Docker Database Initialization Fix

## Problem
When running the application in a Docker/Podman container using `podman compose up --build`, the backend would fail with:
```
error: {
  message: "no such table: users",
  code: -32603
}
```

This occurred because the database schema was never created in the container. The application would try to query the database without initializing it first.

## Root Cause
1. The Docker container was configured to run the backend server directly
2. No database initialization (schema creation) was performed before starting the server
3. The database file path was set to `/app/data/sqlite.db` (mounted volume) but tables were never created
4. When the backend tried to execute queries, the tables didn't exist

## Solution
Added automatic database initialization on container startup:

### 1. Created Database Initialization Script (`packages/backend/src/db-init.ts`)
- Reads the Drizzle migration file (`packages/backend/drizzle/0000_hesitant_agent_brand.sql`)
- Connects to the SQLite database at the `DATABASE_URL`
- Creates all required tables if they don't exist
- Handles errors gracefully (skips if tables already exist)

### 2. Updated Drizzle Configuration (`drizzle.config.ts`)
- Made it respect the `DATABASE_URL` environment variable
- Falls back to `./sqlite.db` if not set
- Allows migrations to work in any environment

### 3. Created Docker Entrypoint Script (`docker-entrypoint.sh`)
- Runs before the backend server starts
- Calls `db-init.js` to initialize the database schema
- Sets up the `/app/data` directory structure
- Starts the backend server once database is ready

### 4. Updated Dockerfile
- Copies migration files to the image
- Copies the entrypoint script
- Makes entrypoint executable
- Changes from `CMD` to `ENTRYPOINT` to run the initialization script

## Usage

### With Docker Compose (Recommended)
```bash
podman compose up --build
```

The container will automatically:
1. Create the SQLite database at `/app/data/sqlite.db`
2. Initialize all tables
3. Start the backend server

### Seeding Test Data
To populate the database with test users and events:

**Option 1: Before Container Startup**
```bash
JWT_SECRET=your-secret pnpm run db:seed
# Then start the container
podman compose up
```

**Option 2: After Container Startup**
If you have the container running and want to seed it:
```bash
# In the container
podman exec event-managing-platform_app_1 sh -c "cd /app && JWT_SECRET=test pnpm run db:seed"
```

### Manual Database Access
To check the database from the host:
```bash
sqlite3 sqlite_data/sqlite.db "SELECT * FROM users;"
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `/app/data/sqlite.db` | Database file location in container |
| `PROFILE_UPLOAD_DIR` | `/app/uploads` | Profile image upload directory |
| `JWT_SECRET` | `change-this-in-production` | JWT signing secret |
| `PORT` | `3001` | Server port |

## Testing the Fix

### Test 1: Verify Schema is Created
```bash
# After container starts
sqlite3 sqlite_data/sqlite.db ".tables"
# Should show: attendance_records  event_members  events  users
```

### Test 2: Verify Server is Running
```bash
curl http://localhost:3001/
```

### Test 3: Test Backend Functionality
```bash
# Try to login (should work without "no such table" error)
curl -X POST http://localhost:3001/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"username":"organizer1","password":"password123"}'
```

## Files Changed

1. ✅ `packages/backend/src/db-init.ts` - New initialization script
2. ✅ `packages/backend/drizzle.config.ts` - Uses DATABASE_URL env var
3. ✅ `Dockerfile` - Added entrypoint and migration files
4. ✅ `docker-entrypoint.sh` - New container startup script
5. ✅ `docker-compose.yml` - No changes needed (already has correct setup)

## Troubleshooting

### Still Getting "no such table" Error?
1. Check the database file exists: `ls -la sqlite_data/sqlite.db`
2. Check the initialization ran: Look for "Database schema initialized" in container logs
3. Verify the database has tables: `sqlite3 sqlite_data/sqlite.db ".tables"`

### Database Permission Errors
- Ensure `./sqlite_data` and `./uploads` directories are writable
- Run: `chmod 777 sqlite_data uploads`

### Container Won't Start
- Check Docker build succeeded: `podman compose build`
- Check entrypoint file is executable: `ls -la docker-entrypoint.sh`
- View full logs: `podman compose logs app`

## Future Improvements

1. **Automated Seeding**: Could add a `SEED_DATABASE=true` env var to automatically seed test data on first run
2. **Migration Versioning**: Currently uses a single migration file. Could expand to support multiple versioned migrations
3. **Health Checks**: Add Docker health check that verifies database is accessible
4. **Backup Strategy**: Consider database backup/restore for production deployments
