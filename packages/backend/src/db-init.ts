import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function initializeDatabase() {
  const dbPath = process.env.DATABASE_URL || '/app/data/sqlite.db';
  const dbDir = path.dirname(dbPath);

  // Ensure directory exists
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  console.log(`📍 Database path: ${dbPath}`);

  // Connect to database
  const db = new Database(dbPath);
  db.pragma('foreign_keys = ON');

  try {
    // Read migration file
    const migrationFile = path.join(__dirname, '../drizzle/0000_hesitant_agent_brand.sql');
    const migrationSQL = fs.readFileSync(migrationFile, 'utf-8');

    // Split by statement separator and filter empty statements
    const statements = migrationSQL
      .split('--> statement-breakpoint')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    console.log(`📦 Running ${statements.length} migration statements...`);

    // Check if tables already exist
    const tableResult = db
      .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='users'`)
      .all();

    if (tableResult.length > 0) {
      console.log('✅ Database schema already exists, skipping migration');
      return true;
    }

    // Run each statement
    for (const statement of statements) {
      try {
        db.exec(statement);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn(`⚠️  Statement failed (may be duplicate): ${message}`);
      }
    }

    console.log('✅ Database schema initialized successfully');
    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('❌ Database initialization failed:', message);
    return false;
  } finally {
    db.close();
  }
}

initializeDatabase()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
