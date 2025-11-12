import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

console.log('DATABASE_URL present:', !!process.env.DATABASE_URL);

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

let pool = null;

if (connectionConfig) {
  pool = new Pool(connectionConfig);

  pool.on('error', (err) => {
    console.error('❌ Pool error:', err.message);
  });

  pool.on('connect', () => {
    console.log('✅ New pool connection created');
  });

  // Test connection
  pool.connect((err, client, release) => {
    if (err) {
      console.error('❌ Pool connection test failed:', err.message);
    } else {
      console.log('✅ Pool connection test successful');
      release();
    }
  });
} else {
  console.warn('⚠️  DATABASE_URL not configured - database operations will fail');
}

// Query wrapper for compatibility
const db = {
  prepare: (sql) => ({
    run: async (...params) => {
      if (!pool) throw new Error('Database not configured - DATABASE_URL is missing');
      try {
        const result = await pool.query(sql, params);
        return { 
          lastID: result.rows[0]?.id || null, 
          changes: result.rowCount,
          rows: result.rows
        };
      } catch (err) {
        console.error('❌ Query error:', err.message);
        console.error('SQL:', sql);
        console.error('Params:', params);
        throw err;
      }
    },
    all: async (...params) => {
      if (!pool) throw new Error('Database not configured - DATABASE_URL is missing');
      try {
        const result = await pool.query(sql, params);
        return result.rows || [];
      } catch (err) {
        console.error('❌ Query error:', err.message);
        throw err;
      }
    },
    get: async (...params) => {
      if (!pool) throw new Error('Database not configured - DATABASE_URL is missing');
      try {
        const result = await pool.query(sql, params);
        return result.rows[0] || null;
      } catch (err) {
        console.error('❌ Query error:', err.message);
        throw err;
      }
    }
  })
};

export default db;

