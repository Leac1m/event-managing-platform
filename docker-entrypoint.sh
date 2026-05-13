#!/bin/sh
set -e

echo "🔧 Initializing database..."

# Set database URL if not already set
export DATABASE_URL="${DATABASE_URL:-/app/data/sqlite.db}"

# Run database schema initialization
echo "📦 Applying schema from migrations..."
node packages/backend/dist/db-init.js

if [ $? -ne 0 ]; then
  echo "❌ Database initialization failed"
  exit 1
fi

# Optionally seed database if SEED_DATABASE=true (seed.ts must be compiled)
# For now, seeding requires running: pnpm run db:seed from host
# Users can also manually seed by running the seed script

echo "✅ Database ready"

# Start the server
echo "🚀 Starting backend server on port ${PORT:-3001}..."
exec node packages/backend/dist/index.js