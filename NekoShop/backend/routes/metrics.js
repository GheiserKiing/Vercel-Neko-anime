// File: backend/routes/metrics.js

const express      = require("express");                                          // este cambio es para importar Express
const sqlite3      = require("sqlite3").verbose();                                // este cambio es para usar SQLite
const path         = require("path");                                             // este cambio es para manejar rutas de fichero
const { promisify }= require("util");                                             // este cambio es para convertir callbacks a promesas

const router       = express.Router();                                            // este cambio es para instanciar el router

// Conectar a la base de datos SQLite
const dbPath   = path.join(__dirname, "../data/products.db");                     // este cambio define ruta de la base de datos
const db       = new sqlite3.Database(dbPath);                                    // este cambio abre la base de datos
const allAsync = promisify(db.all.bind(db));                                      // este cambio convierte db.all en promesa

// ─── GET /api/metrics/sales – Ventas diarias últimos 30 días ────────────────────
router.get("/sales", async (_req, res) => {
  try {
    const rows = await allAsync(`
      SELECT
        date(o.created_at) AS sale_date,
        SUM(oi.quantity * p.price) AS total_sales
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      JOIN products p ON p.id = oi.product_id
      WHERE o.created_at >= datetime('now', '-30 days')
      GROUP BY date(o.created_at)
      ORDER BY sale_date ASC
    `);                                                                            // este cambio corrige alias y elimina error de sintaxis
    res.json({ data: rows });                                                      // este cambio devuelve los datos
  } catch (err) {
    console.error("Error en métricas de ventas:", err);                             // este cambio loguea errores
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/metrics/top-products – Productos más vendidos ────────────────────
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
    `);                                                                            // este cambio corrige sintaxis y ordenación
    res.json({ data: rows });                                                      // este cambio devuelve los datos
  } catch (err) {
    console.error("Error en métricas de top-products:", err);                       // este cambio loguea errores
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;                                                          // este cambio exporta el router
