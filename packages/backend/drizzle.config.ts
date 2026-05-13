import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './packages/backend/src/db/schema/index.ts',
  out: './packages/backend/drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL || './sqlite.db',
  },
});
