// File: NekoShop/backend/scripts/setupPostgresTables.js
const pool = require("../db-postgres");

async function main() {
  // crea tabla suppliers si no existe
  await pool.query(`
    CREATE TABLE IF NOT EXISTS suppliers (
      id SERIAL PRIMARY KEY,
      name TEXT,
      adminUrl TEXT,
      config JSONB
    );
  `);
  console.log("✅ Tabla suppliers creada o ya existía");
  process.exit(0);
}

main().catch(err => {
  console.error("🛑 Error al crear tablas:", err);
  process.exit(1);
});
