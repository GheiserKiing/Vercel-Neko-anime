// File: backend/routes/bizum.js

const express = require("express");
const router  = express.Router();

// POST /api/pay/bizum
router.post("/", (req, res) => {
  // Aquí harías tu lógica real de Bizum con tu PSP.
  // Por ahora devolvemos una URL de ejemplo (puedes cambiarla).
  const fakeBizumUrl = "https://bizum.example.com/checkout?amount=" + encodeURIComponent(req.body.total);
  res.json({ url: fakeBizumUrl });
});

module.exports = router;
