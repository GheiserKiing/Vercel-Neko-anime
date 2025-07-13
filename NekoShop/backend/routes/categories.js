const express    = require("express");
const sqlite3    = require("sqlite3").verbose();
const path       = require("path");
const { promisify } = require("util");
const router     = express.Router();

// Conexión
const dbPath   = path.join(__dirname, "../data/products.db");
const db       = new sqlite3.Database(dbPath);
const allAsync = promisify(db.all.bind(db));
const getAsync = promisify(db.get.bind(db));
const runAsync = promisify(db.run.bind(db));

// Asegurar tablas
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id   INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT    UNIQUE NOT NULL
    );
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS subcategories (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      name        TEXT    NOT NULL,
      UNIQUE(category_id, name),
      FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE CASCADE
    );
  `);
});

/** GET /api/categories — Listar categorías */
router.get("/", async (_req, res) => {
  try {
    const rows = await allAsync("SELECT id,name FROM categories ORDER BY name;");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error cargando categorías" });
  }
});

/** POST /api/categories — Crear categoría */
router.post("/", express.json(), async (req, res) => {
  const name = (req.body.name || "").trim();
  if (!name) return res.status(400).json({ error: "Nombre requerido" });
  try {
    await runAsync("INSERT INTO categories(name) VALUES(?);", [name]);
    const cat = await getAsync("SELECT id,name FROM categories WHERE id=last_insert_rowid();");
    res.status(201).json(cat);
  } catch (err) {
    if (err.message.includes("UNIQUE")) {
      return res.status(400).json({ error: "Categoría ya existe" });
    }
    res.status(500).json({ error: "Error creando categoría" });
  }
});

/** PUT /api/categories/:id — Actualizar categoría */
router.put("/:id", express.json(), async (req, res) => {
  const id   = Number(req.params.id);
  const name = (req.body.name||"").trim();
  if (!name) return res.status(400).json({ error: "Nombre requerido" });
  try {
    await runAsync("UPDATE categories SET name=? WHERE id=?;", [name, id]);
    const cat = await getAsync("SELECT id,name FROM categories WHERE id=?;", [id]);
    if (!cat) return res.status(404).json({ error: "No encontrada" });
    res.json(cat);
  } catch (err) {
    if (err.message.includes("UNIQUE")) {
      return res.status(400).json({ error: "Categoría ya existe" });
    }
    res.status(500).json({ error: "Error actualizando categoría" });
  }
});

/** DELETE /api/categories/:id — Borrar categoría (y subcats) */
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    await runAsync("DELETE FROM categories WHERE id=?;", [id]);
    res.json({ message: "Eliminada correctamente" });
  } catch {
    res.status(500).json({ error: "Error borrando categoría" });
  }
});

/** GET /api/categories/:id/subcategories — Listar subcategorías */
router.get("/:id/subcategories", async (req, res) => {
  const catId = Number(req.params.id);
  try {
    const rows = await allAsync(
      "SELECT id,name FROM subcategories WHERE category_id=? ORDER BY name;",
      [catId]
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Error cargando subcategorías" });
  }
});

/** POST /api/categories/:id/subcategories — Crear subcategoría */
router.post("/:id/subcategories", express.json(), async (req, res) => {
  const catId = Number(req.params.id);
  const name  = (req.body.name||"").trim();
  if (!name) return res.status(400).json({ error: "Nombre requerido" });
  try {
    await runAsync(
      "INSERT INTO subcategories(category_id,name) VALUES(?,?);",
      [catId, name]
    );
    const sub = await getAsync("SELECT id,name FROM subcategories WHERE id=last_insert_rowid();");
    res.status(201).json(sub);
  } catch (err) {
    if (err.message.includes("UNIQUE")) {
      return res.status(400).json({ error: "Subcategoría ya existe" });
    }
    res.status(500).json({ error: "Error creando subcategoría" });
  }
});

/** PUT /api/categories/:catId/subcategories/:id — Actualizar subcategoría */
router.put("/:catId/subcategories/:id", express.json(), async (req, res) => {
  const id   = Number(req.params.id);
  const name = (req.body.name||"").trim();
  if (!name) return res.status(400).json({ error: "Nombre requerido" });
  try {
    await runAsync("UPDATE subcategories SET name=? WHERE id=?;", [name, id]);
    const sub = await getAsync("SELECT id,name FROM subcategories WHERE id=?;", [id]);
    if (!sub) return res.status(404).json({ error: "No encontrada" });
    res.json(sub);
  } catch (err) {
    if (err.message.includes("UNIQUE")) {
      return res.status(400).json({ error: "Subcategoría ya existe" });
    }
    res.status(500).json({ error: "Error actualizando subcategoría" });
  }
});

/** DELETE /api/categories/:catId/subcategories/:id — Borrar subcategoría */
router.delete("/:catId/subcategories/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    await runAsync("DELETE FROM subcategories WHERE id=?;", [id]);
    res.json({ message: "Eliminada correctamente" });
  } catch {
    res.status(500).json({ error: "Error borrando subcategoría" });
  }
});

module.exports = router;
