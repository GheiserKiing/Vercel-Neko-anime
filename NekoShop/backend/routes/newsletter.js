const express           = require("express");
const sqlite3           = require("sqlite3").verbose();
const path              = require("path");
const { sendWelcomeEmail, sendTemplatedEmail } = require("../services/emailService");

const router = express.Router();
const db     = new sqlite3.Database(path.join(__dirname, "../data/products.db"));

/** POST /api/newsletter — Suscribir */
router.post("/", express.json(), (req, res, next) => {
  const { email, country = "", interest = "" } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Email inválido" });
  }
  db.run(
    `INSERT OR IGNORE INTO newsletter_subscribers (email, country, interest) VALUES (?, ?, ?)`,
    [email, country, interest],
    function(err) {
      if (err) return next(err);
      if (this.changes === 0) {
        return res.status(409).json({ error: "Email ya suscrito" });
      }
      sendWelcomeEmail(email).catch(console.error);
      res.json({ ok: true });
    }
  );
});

/** GET /api/newsletter — Listar suscriptores */
router.get("/", (req, res, next) => {
  db.all(
    `SELECT id, email, country, interest, subscribed_at AS subscribedAt
     FROM newsletter_subscribers
     ORDER BY subscribed_at DESC`,
    (err, rows) => {
      if (err) return next(err);
      res.json(rows);
    }
  );
});

/** POST /api/newsletter/campaign — Enviar campaña segmentada */
router.post("/campaign", express.json(), (req, res, next) => {
  const { segment = {}, subject, body } = req.body;
  if (!subject || !body) {
    return res.status(400).json({ error: "Subject & body required" });
  }
  const clauses = [], params = [];
  if (segment.interest) { clauses.push("interest = ?"); params.push(segment.interest); }
  if (segment.country)  { clauses.push("country = ?");  params.push(segment.country); }
  if (segment.domain)   { clauses.push("email LIKE ?");  params.push(`%@${segment.domain}`); }
  const where = clauses.length ? "WHERE " + clauses.join(" AND ") : "";

  db.all(`SELECT email FROM newsletter_subscribers ${where}`, params, async (err, rows) => {
    if (err) return next(err);
    try {
      let sent = 0;
      for (const { email } of rows) {
        await sendTemplatedEmail("newsletter_campaign", { body }, email);
        sent++;
      }
      res.json({ sent });
    } catch (e) {
      next(e);
    }
  });
});

module.exports = router;
