// File: NekoShop/NekoShop/backend/scripts/listSuppliers.js

/**
 * Script 100% completo para listar los suppliers registrados
 * en tu base de datos SQLite, mostrando su id y nombre.
 */

const sqlite3 = require("sqlite3").verbose();
const path    = require("path");

// Ruta a tu fichero products.db
const dbFile = path.join(__dirname, "..", "data", "products.db");
const db     = new sqlite3.Database(dbFile, err => {
  if (err) {
    console.error("❌ Error abriendo la base de datos:", err);
    process.exit(1);
  }
});

db.serialize(() => {
  console.log("📋 Lista de suppliers (id — name):");
  db.each(
    "SELECT id, name FROM suppliers ORDER BY id;",
    (err, row) => {
      if (err) {
        console.error("❌ Error al leer suppliers:", err);
        process.exit(1);
      }
      console.log(`• ${row.id} — ${row.name}`);
    },
    () => {
      db.close();
    }
  );
});
