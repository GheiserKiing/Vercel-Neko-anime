// File: backend/db.js
const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('❌ Error: falta la variable DATABASE_URL');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
