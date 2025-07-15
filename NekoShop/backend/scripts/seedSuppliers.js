// File: NekoShop/backend/scripts/seedSuppliers.js
require("dotenv").config();
const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const res = await pool.query(
    `INSERT INTO suppliers (name, adminurl, config)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [
      "AliExpress Demo",
      "", // pon aquí la URL de tu admin (p.ej. tu frontend admin)
      JSON.stringify({
        appKey:    "TU_APP_KEY_DE_ALIEXPRESS",
        appSecret: "TU_APP_SECRET_DE_ALIEXPRESS"
      })
    ]
  );
  console.log("✅ Supplier creado con id =", res.rows[0].id);
  process.exit(0);
}

main().catch(err => {
  console.error("🛑 Error en seedSuppliers:", err);
  process.exit(1);
});
