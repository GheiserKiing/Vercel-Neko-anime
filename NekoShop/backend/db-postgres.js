// File: NekoShop/backend/db-postgres.js

/**
 * Pool de conexiones a PostgreSQL (Render) usando SSL.
 */
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host:     process.env.PG_HOST,
  port:     parseInt(process.env.PG_PORT, 10) || 5432,
  database: process.env.PG_DATABASE,
  user:     process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  max:      20,
  idleTimeoutMillis: 30000,
  ssl: {
    rejectUnauthorized: false
  },
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado PostgreSQL', err);
  process.exit(-1);
});

module.exports = pool;
