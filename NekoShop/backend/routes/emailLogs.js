const express = require("express");
const router  = express.Router();
const sqlite3 = require("sqlite3").verbose();
const path    = require("path");

const dbPath = path.join(__dirname, "../data/products.db");
const db     = new sqlite3.Database(dbPath);

// GET /api/email-logs
router.get("/", (req, res, next) => {
  db.all(
    `SELECT id, kind, order_id, recipient, subject, body, sent_at
     FROM email_logs
     ORDER BY sent_at DESC
     LIMIT 100`,
    (err, rows) => {
      if (err) return next(err);
      res.json(rows);
    }
  );
});

module.exports = router;
