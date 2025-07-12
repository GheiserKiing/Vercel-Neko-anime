// File: backend/routes/suppliers.js
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path    = require("path");
const { promisify } = require("util");
const router  = express.Router();

// Conexión a la misma DB
const dbPath = path.join(__dirname, "../data/products.db");
const db     = new sqlite3.Database(dbPath);
const allAsync = promisify(db.all.bind(db));
const runAsync = promisify(db.run.bind(db));

// GET /api/suppliers — Listar proveedores
router.get("/", async (_req, res) => {
  try {
    const rows = await allAsync(
      `SELECT id, name, api_url, config, callbackUrl, adminUrl, created_at
       FROM suppliers
       ORDER BY created_at DESC;`
    );
    // config se almacena como JSON-string, así que parseamos
    const data = rows.map(r => ({
      ...r,
      config: typeof r.config === "string" ? JSON.parse(r.config) : r.config
    }));
    res.json(data);
  } catch (err) {
    console.error("Error en GET /api/suppliers:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/suppliers — Crear proveedor
router.post("/", express.json(), async (req, res) => {
  const { name, api_url, config, callbackUrl, adminUrl } = req.body;
  try {
    const cfg = JSON.stringify(config || {});
    const result = await runAsync(
      `INSERT INTO suppliers (name, api_url, config, callbackUrl, adminUrl)
       VALUES (?, ?, ?, ?, ?);`,
      [name, api_url, cfg, callbackUrl, adminUrl]
    );
    const newProv = await allAsync(
      `SELECT id, name, api_url, config, callbackUrl, adminUrl, created_at
       FROM suppliers WHERE id = ?;`,
      [result.lastID]
    );
    const prov = newProv[0];
    prov.config = JSON.parse(prov.config);
    res.status(201).json(prov);
  } catch (err) {
    console.error("Error en POST /api/suppliers:", err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/suppliers/:id — Actualizar proveedor
router.put("/:id", express.json(), async (req, res) => {
  const id = Number(req.params.id);
  const { name, api_url, config, callbackUrl, adminUrl } = req.body;
  try {
    const cfg = JSON.stringify(config || {});
    await runAsync(
      `UPDATE suppliers SET name=?, api_url=?, config=?, callbackUrl=?, adminUrl=?
       WHERE id=?;`,
      [name, api_url, cfg, callbackUrl, adminUrl, id]
    );
    const rows = await allAsync(
      `SELECT id, name, api_url, config, callbackUrl, adminUrl, created_at
       FROM suppliers WHERE id = ?;`,
      [id]
    );
    const prov = rows[0];
    prov.config = JSON.parse(prov.config);
    res.json(prov);
  } catch (err) {
    console.error("Error en PUT /api/suppliers/:id:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/suppliers/:id — Eliminar proveedor
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    const result = await runAsync(
      `DELETE FROM suppliers WHERE id = ?;`,
      [id]
    );
    res.json({ deleted: result.changes });
  } catch (err) {
    console.error("Error en DELETE /api/suppliers/:id:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
