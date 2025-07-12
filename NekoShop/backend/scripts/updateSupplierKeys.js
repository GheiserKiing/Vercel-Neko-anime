// File: backend/scripts/updateSupplierKeys.js

/**
 * Script para actualizar el appKey y appSecret de un supplier en SQLite.
 * Uso: node updateSupplierKeys.js <SUPPLIER_ID> <APP_KEY> <APP_SECRET>
 */

const path = require("path");
const sqlite3 = require("sqlite3").verbose();

// Parámetros de línea de comandos
const [ , , supplierId, appKey, appSecret ] = process.argv;

if (!supplierId || !appKey || !appSecret) {
  console.error("Uso: node updateSupplierKeys.js <SUPPLIER_ID> <APP_KEY> <APP_SECRET>");
  process.exit(1);
}

// Abre la base de datos
const dbPath = path.join(__dirname, "../data/products.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error al abrir la base de datos:", err.message);
    process.exit(1);
  }
});

// Construye el nuevo config
const newConfig = JSON.stringify({ appKey: appKey, appSecret: appSecret });

// Ejecuta el UPDATE
db.run(
  "UPDATE suppliers SET config = ? WHERE id = ?",
  [newConfig, supplierId],
  function(err) {
    if (err) {
      console.error("Error actualizando el supplier:", err.message);
    } else if (this.changes === 0) {
      console.warn("No se encontró ningún supplier con id =", supplierId);
    } else {
      console.log(`✅ Supplier ${supplierId} actualizado con éxito.`);
    }
    db.close();
  }
);
