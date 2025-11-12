import sqlite3 from 'sqlite3';
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

const sqlite3Db = new sqlite3.Database(dbPath);

// Wrapper object to maintain compatibility
const db = {
  prepare: (sql) => ({
    run: (...params) => {
      return new Promise((resolve, reject) => {
        sqlite3Db.run(sql, params, function(err) {
          if (err) reject(err);
          else resolve({ lastID: this.lastID, changes: this.changes });
        });
      });
    },
    all: (...params) => {
      return new Promise((resolve, reject) => {
        sqlite3Db.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
    },
    get: (...params) => {
      return new Promise((resolve, reject) => {
        sqlite3Db.get(sql, params, (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    }
  })
};

// Initialize tables
async function initializeTables() {
  try {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    await db.prepare(`
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
  } catch (err) {
    console.error('Error initializing tables:', err);
  }
}

initializeTables();

export default db;

