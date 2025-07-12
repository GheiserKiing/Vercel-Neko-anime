// File: NekoShop/NekoShop/backend/routes/auth.js
const express = require("express");
const jwt     = require("jsonwebtoken");
require("dotenv").config();

const router = express.Router();

// 👉 Añadimos logs para verificar ENV
console.log("🔑 ADMIN_USER env:", process.env.ADMIN_USER);
console.log("🔑 ADMIN_PASS env:", process.env.ADMIN_PASS);

// POST /api/login
router.post("/", express.json(), (req, res) => {
  const { username, password } = req.body;
  if (
    username !== process.env.ADMIN_USER ||
    password !== process.env.ADMIN_PASS
  ) {
    return res
      .status(401)
      .json({ error: "Usuario o contraseña incorrectos" });
  }
  const token = jwt.sign(
    { username },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );
  res.json({ token });
});

module.exports = router;
