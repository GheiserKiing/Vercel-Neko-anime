// File: backend/routes/orders.js
const express  = require("express");
const sqlite3  = require("sqlite3").verbose();
const path     = require("path");
const router   = express.Router();

const dbPath = path.join(__dirname, "../data/products.db");
const db     = new sqlite3.Database(dbPath);

// GET /api/orders
router.get("/", (req, res) => {
  const limit  = parseInt(req.query.limit)  || 10;
  const offset = parseInt(req.query.offset) || 0;
  const sql = `
    SELECT
      o.id,
      o.user_id             AS user,
      o.customer_name,
      o.customer_email,
      o.shipping_address,
      o.payment_method,
      o.status,
      o.created_at          AS date,
      IFNULL(SUM(oi.quantity * oi.price), 0) AS total
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    GROUP BY o.id
    ORDER BY o.created_at DESC
    LIMIT ? OFFSET ?;
  `;
  db.all(sql, [limit, offset], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST /api/orders
router.post("/", (req, res) => {
  const {
    user_id,
    customer_name,
    customer_email,
    shipping_address,
    payment_method,
    items,
  } = req.body;

  if (
    !user_id ||
    !customer_name ||
    !customer_email ||
    !shipping_address ||
    !payment_method ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return res.status(400).json({
      error:
        "Faltan user_id, customer_name, customer_email, shipping_address, payment_method o items (array no vacío)",
    });
  }

  // Inserta cabecera
  db.run(
    `INSERT INTO orders
       (user_id, customer_name, customer_email, shipping_address, payment_method)
     VALUES (?, ?, ?, ?, ?);`,
    [
      user_id,
      customer_name.trim(),
      customer_email.trim(),
      shipping_address.trim(),
      payment_method.trim(),
    ],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      const orderId = this.lastID;

      // Inserta líneas
      const stmt = db.prepare(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES (?, ?, ?, ?);`
      );
      items.forEach(it => {
        stmt.run(orderId, it.product_id, it.quantity, it.price);
      });
      stmt.finalize(err => {
        if (err) console.error("Error insertando items:", err);

        // Recupera el pedido completo
        const sql = `
          SELECT
            o.id,
            o.user_id             AS user,
            o.customer_name,
            o.customer_email,
            o.shipping_address,
            o.payment_method,
            o.status,
            o.created_at          AS date,
            IFNULL(SUM(oi.quantity * oi.price), 0) AS total
          FROM orders o
          LEFT JOIN order_items oi ON oi.order_id = o.id
          WHERE o.id = ?
          GROUP BY o.id;
        `;
        db.get(sql, [orderId], (err, order) => {
          if (err) return res.status(500).json({ error: err.message });
          res.status(201).json(order);
        });
      });
    }
  );
});

module.exports = router;
