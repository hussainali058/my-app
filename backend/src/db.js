import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'punjab-university.db');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`).run();

// Migrate existing data from password_hash to password column if needed
try {
  const hasPasswordHashColumn = db.prepare("PRAGMA table_info(users)").all().some(col => col.name === 'password_hash');
  if (hasPasswordHashColumn && !db.prepare("PRAGMA table_info(users)").all().some(col => col.name === 'password')) {
    db.prepare('ALTER TABLE users RENAME COLUMN password_hash TO password').run();
  }
} catch (err) {
  // Column might not exist, which is fine
}

db.prepare(`
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    full_name TEXT NOT NULL,
    batch_number TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    department TEXT,
    society_affiliation TEXT,
    interests TEXT,
    emergency_contact TEXT,
    dietary_preferences TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`).run();

export default db;

