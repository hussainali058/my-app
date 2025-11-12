import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

// Use DATABASE_URL from environment or fallback to SQLite-like setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : undefined,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Query wrapper for compatibility
const db = {
  prepare: (sql) => ({
    run: async (...params) => {
      try {
        const result = await pool.query(sql, params);
        return { 
          lastID: result.rows[0]?.id || null, 
          changes: result.rowCount 
        };
      } catch (err) {
        throw err;
      }
    },
    all: async (...params) => {
      try {
        const result = await pool.query(sql, params);
        return result.rows || [];
      } catch (err) {
        throw err;
      }
    },
    get: async (...params) => {
      try {
        const result = await pool.query(sql, params);
        return result.rows[0] || null;
      } catch (err) {
        throw err;
      }
    }
  })
};

// Initialize tables only if DATABASE_URL is set (production with Supabase)
async function initializeTables() {
  // Tables are already created in Supabase, no need to create them here
  console.log('Database connection ready');
}

initializeTables();

export default db;

