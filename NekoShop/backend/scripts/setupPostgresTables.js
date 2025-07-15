// File: NekoShop/backend/scripts/setupPostgresTables.js
require("dotenv").config();
const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS suppliers (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      adminurl TEXT,
      config JSONB
    );
  `);
  console.log("✅ Tabla suppliers creada o ya existía");
  process.exit(0);
}
main().catch(err => { console.error(err); process.exit(1); });
