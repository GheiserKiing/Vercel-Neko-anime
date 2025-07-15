// File: NekoShop/backend/setupDb.js
require('dotenv').config();            // ← Carga las variables de entorno
const { Pool } = require('pg');

// Usa tu URL completa de la .env
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function setup() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS supplier_tokens (
      supplier_id INTEGER PRIMARY KEY,
      access_token TEXT NOT NULL,
      refresh_token TEXT,
      expires_at TIMESTAMPTZ
    );
  `);
  console.log('✅ supplier_tokens table ready');
  process.exit(0);
}

setup().catch(err => {
  console.error(err);
  process.exit(1);
});
