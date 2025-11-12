import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

// Parse connection string with proper handling
const connectionConfig = process.env.DATABASE_URL 
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    }
  : null;

const pool = connectionConfig ? new Pool(connectionConfig) : null;

if (pool) {
  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
  });

  pool.on('connect', () => {
    console.log('✅ Connected to Supabase');
  });
}

// Query wrapper for compatibility
const db = {
  prepare: (sql) => ({
    run: async (...params) => {
      if (!pool) throw new Error('Database not configured');
      try {
        const result = await pool.query(sql, params);
        return { 
          lastID: result.rows[0]?.id || null, 
          changes: result.rowCount 
        };
      } catch (err) {
        console.error('Query error:', err.message, sql);
        throw err;
      }
    },
    all: async (...params) => {
      if (!pool) throw new Error('Database not configured');
      try {
        const result = await pool.query(sql, params);
        return result.rows || [];
      } catch (err) {
        console.error('Query error:', err.message, sql);
        throw err;
      }
    },
    get: async (...params) => {
      if (!pool) throw new Error('Database not configured');
      try {
        const result = await pool.query(sql, params);
        return result.rows[0] || null;
      } catch (err) {
        console.error('Query error:', err.message, sql);
        throw err;
      }
    }
  })
};

// Initialize connection
async function initializeDatabase() {
  if (!pool) {
    console.warn('⚠️  Database URL not configured, using fallback');
    return;
  }
  
  try {
    const client = await pool.connect();
    console.log('✅ Database connection pool initialized');
    client.release();
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    throw err;
  }
}

initializeDatabase().catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

export default db;

