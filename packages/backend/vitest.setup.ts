import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize test database
const dbPath = process.env.DATABASE_URL || path.join(__dirname, 'sqlite.db');
const sqlite = new Database(dbPath);
sqlite.pragma('foreign_keys = ON');

// Read and execute migration SQL file
const migrationPath = path.join(__dirname, 'drizzle/0000_hesitant_agent_brand.sql');
if (fs.existsSync(migrationPath)) {
  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
  // Split by statement-breakpoint and execute each statement
  const statements = migrationSQL
    .split('--> statement-breakpoint')
    .map((stmt) => stmt.trim())
    .filter((stmt) => stmt && !stmt.startsWith('--'));

  for (const stmt of statements) {
    try {
      sqlite.exec(stmt);
    } catch (error) {
      // Ignore "table already exists" errors
      if (!(error instanceof Error && error.message.includes('already exists'))) {
        throw error;
      }
    }
  }
}

sqlite.close();
