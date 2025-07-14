// File: backend/routes/suppliers.js

const express = require("express");
const router  = express.Router();
const pool    = require("../db-postgres"); // tu pool de Postgres

// GET /api/suppliers/:id — devuelve id, name y config como objeto
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    const { rows } = await pool.query(
      `SELECT id, name, config, "adminUrl"
       FROM suppliers
       WHERE id = $1`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Proveedor no encontrado" });
    }
    const sup = rows[0];
    // config está en texto JSON en la BD, lo parseamos
    sup.config = sup.config ? JSON.parse(sup.config) : {};
    res.json(sup);
  } catch (err) {
    console.error("Error leyendo supplier:", err);
    res.status(500).json({ error: "Error interno" });
  }
});

module.exports = router;
