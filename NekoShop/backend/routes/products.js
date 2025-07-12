// File: backend/routes/products.js
const express   = require("express");
const path      = require("path");
const sqlite3   = require("sqlite3").verbose();

const router  = express.Router();

// Conexión a la base SQLite
const dbFile = path.join(__dirname, "../data/products.db");
const db     = new sqlite3.Database(dbFile, err => {
  if (err) console.error("DB error:", err);
});

// Helper para construir URL pública de las imágenes
function toHostUrl(req, url) {
  // Si la URL ya empieza con http, la devolvemos tal cual.
  if (/^https?:\/\//.test(url)) return url;
  // Si fuera un path local (no es nuestro caso), montaríamos /uploads.
  return `${req.protocol}://${req.get("host")}/uploads/${url}`;
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
        const images = imgs.map(url => toHostUrl(req, url));
        const coverUrl = r.cover_image_url ? toHostUrl(req, r.cover_image_url) : (images[0] || null);
        return {
          ...r,
          images,
          cover_image_url: coverUrl
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
    const images = imgs.map(url => toHostUrl(req, url));
    const coverUrl = r.cover_image_url ? toHostUrl(req, r.cover_image_url) : (images[0] || null);
    res.json({
      ...r,
      images,
      cover_image_url: coverUrl
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

// ─── POST /api/products/:id/images ─── Asociar imágenes subidas a Cloudinary ───
router.post("/:id/images", express.json(), async (req, res) => {
  try {
    const id = +req.params.id;
    const { urls, coverIndex } = req.body;
    if (!Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: "urls debe ser un array no vacío" });
    }
    // Guardar en DB
    const cover = urls[coverIndex] || urls[0];
    await new Promise((resolve, reject) => {
      db.run(
        "UPDATE products SET images = ?, cover_image_url = ? WHERE id = ?",
        [JSON.stringify(urls), cover, id],
        err => err ? reject(err) : resolve()
      );
    });
    // Devolver data lista para el frontend
    const fullUrls = urls.map(url => toHostUrl(req, url));
    res.json({ images: fullUrls, cover_image_url: toHostUrl(req, cover) });
  } catch (err) {
    console.error("Error asociando imágenes:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
