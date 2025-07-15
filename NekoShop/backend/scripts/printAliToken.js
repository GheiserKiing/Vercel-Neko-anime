// File: NekoShop/backend/scripts/printAliToken.js
// ──────────────────────────────────────────────────────────────────────────────
// Este script lee de la BD el access_token de AliExpress y lo imprime.

require("dotenv").config();
const pool = require("../db-postgres");

(async () => {
  try {
    // Cambia el 9 por tu supplierId si es otro
    const supplierId = 9;  
    const result = await pool.query(
      `SELECT (config->'tokenData'->>'access_token') AS token
       FROM suppliers
       WHERE id = $1`,
      [supplierId]
    );
    if (result.rows.length === 0) {
      console.log("❌ No se encontró supplier con id =", supplierId);
    } else {
      console.log("🔑 Tu access_token es:\n", result.rows[0].token);
    }
  } catch (err) {
    console.error("❌ Error al leer token:", err);
  } finally {
    process.exit(0);
  }
})();
