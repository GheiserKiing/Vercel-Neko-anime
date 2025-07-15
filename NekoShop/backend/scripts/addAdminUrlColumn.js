require("dotenv").config();
const pool = require("../db-postgres");

(async () => {
  try {
    await pool.query(`
      ALTER TABLE suppliers
      ADD COLUMN IF NOT EXISTS admin_url TEXT;
    `);

    console.log("✅ Columna admin_url añadida correctamente");
    process.exit();
  } catch (err) {
    console.error("❌ Error al añadir columna admin_url:", err);
    process.exit(1);
  }
})();
