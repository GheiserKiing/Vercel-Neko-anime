// File: backend/routes/products.js

const express      = require("express");
const multer       = require("multer");
const cloudinary   = require("cloudinary").v2;
const streamifier  = require("streamifier");
const pool         = require("../db-postgres");

const router = express.Router();

// Configura Cloudinary (asegúrate de tener las vars en tu .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer en memoria
const upload = multer({ storage: multer.memoryStorage() });

// Helper para mapear DB → JS
function toCamel(r) {
  let imgs = [];
  try {
    if (Array.isArray(r.images))         imgs = r.images;
    else if (typeof r.images === "string") imgs = JSON.parse(r.images);
  } catch { imgs = []; }
  return {
    id:               r.id,
    sku:              r.sku,
    name:             r.name,
    description:      r.description,
    price:            parseFloat(r.price),
    stock:            parseInt(r.stock, 10),
    category_id:      r.category_id,
    subcategory_id:   r.subcategory_id,
    images:           imgs,
    cover_image_url:  r.cover_image_url,
  };
}

// ─── GET /api/products ─── Listar ────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const clauses = [], params = [];
    if (req.query.category_id)    { clauses.push(`category_id=$${params.length+1}`);    params.push(req.query.category_id); }
    if (req.query.subcategory_id) { clauses.push(`subcategory_id=$${params.length+1}`); params.push(req.query.subcategory_id); }
    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

    // total
    const tot = await pool.query(`SELECT COUNT(*) FROM products ${where}`, params);
    const total = parseInt(tot.rows[0].count, 10);

    // order + pagination
    let order = "ORDER BY id DESC";
    if (req.query.sort === "price_asc")  order = "ORDER BY price ASC";
    if (req.query.sort === "price_desc") order = "ORDER BY price DESC";
    const page     = Math.max(parseInt(req.query.page)||1,1);
    const per_page = Math.max(parseInt(req.query.per_page)||total,total);
    const offset   = (page-1)*per_page;

    const data = await pool.query(
      `SELECT * FROM products
       ${where}
       ${order}
       LIMIT $${params.length+1} OFFSET $${params.length+2}`,
      [...params, per_page, offset]
    );
    res.json({ data: data.rows.map(toCamel), total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/products/:id ─── Uno ──────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const id = +req.params.id;
    const { rows, rowCount } = await pool.query("SELECT * FROM products WHERE id=$1", [id]);
    if (!rowCount) return res.status(404).json({ error:"Not found" });
    res.json(toCamel(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/products ─── Crear ───────────────────────────────────────
router.post("/", express.json(), async (req, res) => {
  try {
    const { sku,name,description,price,stock,category_id,subcategory_id } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO products
       (sku,name,description,price,stock,category_id,subcategory_id,images,cover_image_url)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [sku,name,description||"",price,stock,category_id,subcategory_id,JSON.stringify([]),null]
    );
    res.status(201).json(toCamel(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ─── PUT /api/products/:id ─── Actualizar ───────────────────────────────
router.put("/:id", express.json(), async (req, res) => {
  try {
    const id = +req.params.id;
    const { sku,name,description,price,stock,category_id,subcategory_id } = req.body;
    const result = await pool.query(
      `UPDATE products SET
         sku=$1,name=$2,description=$3,price=$4,stock=$5,
         category_id=$6,subcategory_id=$7
       WHERE id=$8 RETURNING *`,
      [sku,name,description,price,stock,category_id,subcategory_id,id]
    );
    if (!result.rowCount) return res.status(404).json({ error:"Not found" });
    res.json(toCamel(result.rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE /api/products/:id ─── Borrar ────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const id = +req.params.id;
    const result = await pool.query("DELETE FROM products WHERE id=$1", [id]);
    res.json({ deleted: result.rowCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/products/:id/images ─── Imágenes ─────────────────────────
router.post("/:id/images", upload.array("images"), async (req, res) => {
  try {
    const id = +req.params.id;

    // 1) Parsear qué filenames eliminar y cover index
    const removed = JSON.parse(req.body.removed || "[]");
    const coverIndex = parseInt(req.body.cover_index,10) || 0;

    // 2) Traer current images de la DB
    const cur = await pool.query("SELECT images FROM products WHERE id=$1",[id]);
    if (!cur.rowCount) return res.status(404).json({ error:"Not found" });
    let current = [];
    try { current = JSON.parse(cur.rows[0].images||"[]"); } catch {}

    // 3) Filtrar eliminados
    const filtered = current.filter(url => !removed.includes(url.split("/").pop()));

    // 4) Helper subir buffer a Cloudinary
    const uploadBuffer = (buffer) => new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "products" },
        (err, result) => err ? reject(err) : resolve(result.secure_url)
      );
      streamifier.createReadStream(buffer).pipe(uploadStream);
    });

    // 5) Subir nuevas
    const newFiles = req.files||[];
    const newUrls  = await Promise.all(newFiles.map(f => uploadBuffer(f.buffer)));

    // 6) Lista final + cover
    const all = [...filtered, ...newUrls];
    const cover = all[coverIndex]||all[0]||null;

    // 7) Actualizar en la DB
    await pool.query(
      "UPDATE products SET images=$1, cover_image_url=$2 WHERE id=$3",
      [JSON.stringify(all), cover, id]
    );

    // 8) Responder con URLs absolutas (frontend ya tiene la parte de HOST)
    res.json({ images: all, cover_image_url: cover });
  } catch (err) {
    console.error("Images upload error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
