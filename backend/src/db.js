import pkg from 'pg';
import dotenv from 'dotenv';
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || 'development';

let db;

if (NODE_ENV === 'production') {
  // Production: PostgreSQL
  const { Pool } = pkg;

  db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  db.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
  });

  console.log('Using PostgreSQL database');
} else {
  // Development: SQLite
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const dataDir = path.join(__dirname, '..', 'data');
  const dbPath = path.join(dataDir, 'punjab-university.db');

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  console.log('Using SQLite database');
}

// Initialize database tables
async function initializeDatabase() {
  try {
    if (NODE_ENV === 'production') {
      // PostgreSQL initialization
      await db.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await db.query(`
        CREATE TABLE IF NOT EXISTS students (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          full_name TEXT NOT NULL,
          batch_number TEXT NOT NULL,
          phone_number TEXT NOT NULL,
          department TEXT,
          society_affiliation TEXT,
          interests TEXT,
          emergency_contact TEXT,
          dietary_preferences TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
    } else {
      // SQLite initialization
      db.prepare(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `).run();

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
    }

    console.log('Database tables initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

// Initialize tables on startup
initializeDatabase();

export default db;
export { NODE_ENV };

