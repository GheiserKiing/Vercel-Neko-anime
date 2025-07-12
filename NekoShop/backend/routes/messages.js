const express = require("express");
const router  = express.Router();
const sqlite3 = require("sqlite3").verbose();
const path    = require("path");

const dbPath = path.join(__dirname, "../data/products.db");
const db     = new sqlite3.Database(dbPath);

// GET /api/messages
router.get("/", (req, res, next) => {
  db.all(
    `SELECT id, type, title, text, created_at, read
     FROM messages
     ORDER BY created_at DESC`,
    (err, rows) => {
      if (err) return next(err);
      res.json(rows);
    }
  );
});

// POST /api/messages
router.post("/", (req, res, next) => {
  const { type, title, text } = req.body;
  if (!type || !title || !text) {
    return res.status(400).json({ error: "type, title y text son obligatorios" });
  }
  db.run(
    `INSERT INTO messages(type,title,text,created_at,read)
     VALUES(?,?,?,?,0)`,
    [type, title, text, Math.floor(Date.now() / 1000)],
    function(err) {
      if (err) return next(err);
      res.status(201).json({ id: this.lastID });
    }
  );
});

// DELETE /api/messages/:id
router.delete("/:id", (req, res, next) => {
  db.run("DELETE FROM messages WHERE id = ?", [req.params.id], function(err) {
    if (err) return next(err);
    if (this.changes === 0) return res.status(404).json({ error: "No encontrado" });
    res.status(204).end();
  });
});

module.exports = router;
