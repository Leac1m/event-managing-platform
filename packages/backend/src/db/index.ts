import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema/index.js';
import path from 'path';
import fs from 'fs';

const dbPath = process.env.DATABASE_URL || 'sqlite.db';

// Ensure directory exists if it's a path
const dbDir = path.dirname(dbPath);
if (dbDir !== '.' && !fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const sqlite = new Database(dbPath);
sqlite.pragma('foreign_keys = ON');
export const db = drizzle(sqlite, { schema });
