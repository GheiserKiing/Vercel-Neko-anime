// File: backend/routes/emailTemplates.js
const express = require("express");
const router  = express.Router();
const sqlite3 = require("sqlite3").verbose();
const path    = require("path");

const db = new sqlite3.Database(path.join(__dirname, "../data/products.db"));

// GET /api/email-templates
router.get("/", (req, res, next) => {
  db.all(
    "SELECT key, subject_template, body_template FROM email_templates ORDER BY key",
    (err, rows) => {
      if (err) return next(err);
      res.json(rows);
    }
  );
});

// PUT /api/email-templates/:key
router.put("/:key", express.json(), (req, res, next) => {
  const { key } = req.params;
  const { subject_template, body_template } = req.body;
  if (!subject_template || !body_template) {
    return res.status(400).json({ error: "Asunto y cuerpo obligatorios" });
  }
  db.run(
    `UPDATE email_templates
     SET subject_template = ?, body_template = ?
     WHERE key = ?`,
    [subject_template, body_template, key],
    function(err) {
      if (err) return next(err);
      if (this.changes === 0) return res.status(404).json({ error: "Plantilla no encontrada" });
      res.json({ ok: true });
    }
  );
});

module.exports = router;
