// File: backend/routes/products.js
const express = require("express");
const path    = require("path");
const fs      = require("fs");
const sqlite3 = require("sqlite3").verbose();
const multer  = require("multer");
const router  = express.Router();

// Conexión a la base SQLite
const dbFile = path.join(__dirname, "../data/products.db");
const db     = new sqlite3.Database(dbFile, err => {
  if (err) console.error("DB error:", err);
});

// Asegura la carpeta uploads
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Configuración de Multer
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename:    (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Helper para construir URL pública de las imágenes
function toHostUrl(req, filename) {
  return `${req.protocol}://${req.get("host")}/uploads/${filename}`;
}

// ─── GET /api/products ─── Listar productos ─────────────────────────────
router.get("/", (req, res) => {
  let where = [], params = [];
  if (req.query.category_id)    { where.push("category_id=?");    params.push(+req.query.category_id); }
  if (req.query.subcategory_id) { where.push("subcategory_id=?"); params.push(+req.query.subcategory_id); }
  const whereSQL = where.length ? "WHERE " + where.join(" AND ") : "";

  db.get(`SELECT COUNT(*) AS count FROM products ${whereSQL}`, params, (e, row) => {
    if (e) return res.status(500).json({ error: e.message });
    const total = row.count;
    let order = "ORDER BY id DESC";
    if (req.query.sort === "price_asc")  order = "ORDER BY price ASC";
    if (req.query.sort === "price_desc") order = "ORDER BY price DESC";
    const page     = Math.max(parseInt(req.query.page) || 1, 1);
    const per_page = Math.max(parseInt(req.query.per_page) || total, total);
    const offset   = (page - 1) * per_page;
    const sql = `SELECT * FROM products ${whereSQL} ${order} LIMIT ${per_page} OFFSET ${offset}`;

    db.all(sql, params, (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      const out = rows.map(r => {
        let imgs = [];
        try { imgs = JSON.parse(r.images || "[]"); } catch {}
        const images = imgs.map(fn => toHostUrl(req, fn));
        const coverFn = r.cover_image_url || imgs[0] || null;
        return {
          ...r,
          images,
          cover_image_url: coverFn ? toHostUrl(req, coverFn) : null
        };
      });
      res.json({ data: out, total });
    });
  });
});

// ─── GET /api/products/:id ─── Obtener producto ─────────────────────────
router.get("/:id", (req, res) => {
  const id = +req.params.id;
  db.get("SELECT * FROM products WHERE id = ?", [id], (err, r) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!r) return res.status(404).json({ error: "Not found" });
    let imgs = [];
    try { imgs = JSON.parse(r.images || "[]"); } catch {}
    const images = imgs.map(fn => toHostUrl(req, fn));
    const coverFn = r.cover_image_url || imgs[0] || null;
    res.json({
      ...r,
      images,
      cover_image_url: coverFn ? toHostUrl(req, coverFn) : null
    });
  });
});

// ─── POST /api/products ─── Crear producto ───────────────────────────────
router.post("/", express.json(), (req, res) => {
  const { sku, name, description, price, stock, category_id, subcategory_id } = req.body;
  const stmt = db.prepare(
    `INSERT INTO products 
      (sku,name,description,price,stock,category_id,subcategory_id,images,cover_image_url)
     VALUES (?,?,?,?,?,?,?,?,?)`
  );
  stmt.run(
    sku,
    name,
    description || "",
    price,
    stock,
    category_id || null,
    subcategory_id || null,
    JSON.stringify([]),
    null,
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get("SELECT * FROM products WHERE id = ?", [this.lastID], (e, row) => {
        if (e) return res.status(500).json({ error: e.message });
        res.status(201).json(row);
      });
    }
  );
});

// ─── PUT /api/products/:id ─── Actualizar producto ───────────────────────
router.put("/:id", express.json(), (req, res) => {
  const id = +req.params.id;
  const { sku, name, description, price, stock, category_id, subcategory_id } = req.body;
  db.run(
    `UPDATE products SET 
       sku=?, name=?, description=?, price=?, stock=?, category_id=?, subcategory_id=?
     WHERE id=?`,
    [sku, name, description, price, stock, category_id||null, subcategory_id||null, id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get("SELECT * FROM products WHERE id = ?", [id], (e, row) => {
        if (e) return res.status(500).json({ error: e.message });
        res.json(row);
      });
    }
  );
});

// ─── DELETE /api/products/:id ─── Eliminar producto ──────────────────────
router.delete("/:id", (req, res) => {
  const id = +req.params.id;
  db.run("DELETE FROM products WHERE id = ?", [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

// ─── POST /api/products/:id/images ─── Gestionar imágenes ────────────────
router.post("/:id/images", upload.array("images"), async (req, res) => {
  try {
    const id = +req.params.id;
    const prev = await new Promise((r, rej) =>
      db.get("SELECT images FROM products WHERE id = ?", [id], (e, row) =>
        e ? rej(e) : r(JSON.parse(row.images || "[]"))
      )
    );
    const removed = JSON.parse(req.body.removed || "[]");
    const kept = prev.filter(fn => !removed.includes(fn));
    const newFiles = req.files.map(f => f.filename);
    const updated = [...kept, ...newFiles];
    const idx = parseInt(req.body.cover_index, 10);
    const cover = (!isNaN(idx) && updated[idx]) ? updated[idx] : (updated[0] || null);

    for (let fn of removed) {
      const p = path.join(uploadDir, fn);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }

    await new Promise((r, rej) =>
      db.run(
        "UPDATE products SET images = ?, cover_image_url = ? WHERE id = ?",
        [JSON.stringify(updated), cover, id],
        err => err ? rej(err) : r()
      )
    );

    const images = updated.map(fn => toHostUrl(req, fn));
    res.json({ images, cover_image_url: cover ? toHostUrl(req, cover) : null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
