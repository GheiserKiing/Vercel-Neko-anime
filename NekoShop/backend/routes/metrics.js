const express       = require("express");
const sqlite3       = require("sqlite3").verbose();
const path          = require("path");
const { promisify } = require("util");

const router   = express.Router();
const dbPath   = path.join(__dirname, "../data/products.db");
const db       = new sqlite3.Database(dbPath);
const allAsync = promisify(db.all.bind(db));

/** GET /api/metrics/sales — Ventas diarias últimos 30 días */
router.get("/sales", async (_req, res) => {
  try {
    const rows = await allAsync(`
      SELECT
        DATE(o.created_at) AS sale_date,
        SUM(oi.quantity * oi.price) AS total_sales
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      WHERE o.created_at >= datetime('now', '-30 days')
      GROUP BY DATE(o.created_at)
      ORDER BY sale_date ASC
    `);
    res.json({ data: rows });
  } catch (err) {
    console.error("Error en métricas de ventas:", err);
    res.status(500).json({ error: err.message });
  }
});

/** GET /api/metrics/top-products — Top 10 productos más vendidos */
router.get("/top-products", async (_req, res) => {
  try {
    const rows = await allAsync(`
      SELECT
        p.id,
        p.name,
        SUM(oi.quantity) AS total_quantity
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      JOIN products p ON p.id = oi.product_id
      WHERE o.created_at >= datetime('now', '-30 days')
      GROUP BY p.id, p.name
      ORDER BY total_quantity DESC
      LIMIT 10
    `);
    res.json({ data: rows });
  } catch (err) {
    console.error("Error en métricas de top-products:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
