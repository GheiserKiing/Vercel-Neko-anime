// File: NekoShop/backend/scripts/seedSuppliers.js
const pool = require("../db-postgres");

async function main() {
  // inserta un supplier de prueba
  const res = await pool.query(
    `INSERT INTO suppliers (name, adminUrl, config)
     VALUES ($1, $2, $3)
     RETURNING id;`,
    [
      "AliExpress (test)",
      process.env.PUBLIC_BACKEND_URL + "/admin",
      JSON.stringify({ appKey: process.env.ALIEXPRESS_APP_KEY, appSecret: process.env.ALIEXPRESS_APP_SECRET })
    ]
  );
  console.log(`✅ Supplier creado con id = ${res.rows[0].id}`);
  process.exit(0);
}

main().catch(err => {
  console.error("🛑 Error en seedSuppliers:", err);
  process.exit(1);
});
