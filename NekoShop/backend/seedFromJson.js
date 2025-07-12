// File: NekoShop/backend/seedFromJson.js

const fs      = require("fs");
const path    = require("path");
const sqlite3 = require("sqlite3").verbose();

// Ruta a la base de datos SQLite
const dbPath = path.join(__dirname, "data", "products.db");
const db     = new sqlite3.Database(dbPath);

// Leer JSON de productos reales
const jsonPath = path.join(__dirname, "..", "frontend", "public", "products.json");
if (!fs.existsSync(jsonPath)) {
  console.error(`❌ No encontrado: ${jsonPath}`);
  process.exit(1);
}
const products = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

// Función auxiliar para limpiar “/uploads/” o “uploads/”
function cleanRaw(raw) {
  if (!raw) return null;
  return raw.replace(/^\/?uploads\/?/, "");
}

db.serialize(() => {
  // 1. Borrar tabla antigua si existe
  db.run(`DROP TABLE IF EXISTS products;`);

  // 2. Crear tabla con los nombres exactos de columnas
  db.run(`
    CREATE TABLE products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sku TEXT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      stock INTEGER DEFAULT 0,
      category_id INTEGER NOT NULL,
      subcategory_id INTEGER,
      description TEXT,
      cover_image TEXT,
      image_url TEXT
    );
  `);

  // 3. Preparar statement de inserción
  const stmt = db.prepare(`
    INSERT INTO products (
      sku, name, price, stock,
      category_id, subcategory_id, description,
      cover_image, image_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
  `);

  // 4. Insertar cada producto, sólo si tiene los campos mínimos
  products.forEach((p, index) => {
    if (!p.name || p.price == null || p.category_id == null) {
      console.warn(`⚠️ Se omite producto índice ${index}: faltan name, price o category_id`);
      return;
    }
    stmt.run(
      p.sku             || null,
      p.name,
      parseFloat(p.price) || 0,
      p.stock != null ? p.stock : 0,
      p.category_id,
      p.subcategory_id != null ? p.subcategory_id : null,
      p.description     || null,
      cleanRaw(p.cover_image),
      cleanRaw(p.image_url)
    );
  });

  // 5. Finalizar
  stmt.finalize(err => {
    if (err) console.error("❌ Error al insertar productos:", err);
    else console.log("👌 Productos cargados desde JSON en SQLite (esquema corregido).");
    db.close();
  });
});
