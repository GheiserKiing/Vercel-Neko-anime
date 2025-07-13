const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path    = require("path");

const router = express.Router();
const dbFile = path.join(__dirname, "../data/products.db");
const db     = new sqlite3.Database(dbFile);

/**
 * POST /api/dropship/import
 * Recibe { products: [ { sku, name, description, price, stock, category_id, subcategory_id } ] }
 */
router.post("/api/dropship/import", express.json(), (req, res) => {
  const prods = Array.isArray(req.body.products) ? req.body.products : [];
  if (!prods.length) {
    return res.status(400).json({ error: "No hay productos para importar" });
  }

  const insertSQL = `
    INSERT INTO products
      (sku, name, description, price, stock, category_id, subcategory_id, images, cover_image_url)
    VALUES (?,?,?,?,?,?,?,'[]', NULL)
  `;
  let inserted = 0;

  db.serialize(() => {
    const stmt = db.prepare(insertSQL);
    for (let p of prods) {
      stmt.run(
        p.sku,
        p.name,
        p.description || "",
        parseFloat(p.price) || 0,
        parseInt(p.stock, 10) || 0,
        p.category_id || null,
        p.subcategory_id || null,
        function(err) {
          if (!err) inserted++;
        }
      );
    }
    stmt.finalize(err => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ inserted });
    });
  });
});

module.exports = router;
