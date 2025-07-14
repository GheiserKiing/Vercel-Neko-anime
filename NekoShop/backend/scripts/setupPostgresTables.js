// File: NekoShop/backend/scripts/setupPostgresTables.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    // Solo la tabla suppliers; si necesitas más tablas, añádelas aquí
    await pool.query(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        adminUrl TEXT,
        config JSONB
      );
    `);
    console.log('✅ Tabla suppliers creada o ya existía');
  } catch (err) {
    console.error('🛑 Error creando tabla suppliers:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
