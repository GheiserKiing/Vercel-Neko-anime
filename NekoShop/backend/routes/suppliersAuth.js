// File: NekoShop/backend/routes/suppliersAuth.js
require("dotenv").config();
const express = require("express");
const axios   = require("axios");
const pool    = require("../db-postgres");          // tu cliente PG configurado

const router = express.Router();

// AliExpress OAuth endpoints
// IMPORTANTE: la URL de autorización debe usar HTTP (no HTTPS) para no recibir 404
const ALI_AUTH_URL  = "http://gw.api.alibaba.com/auth/authorize.htm";
const ALI_TOKEN_URL = "https://gw.api.alibaba.com/openapi/http/1/system.oauth2/getToken";

// Asegúrate de tener en .env PUBLIC_BACKEND_URL definido
if (!process.env.PUBLIC_BACKEND_URL) {
  console.error("🔴 PUBLIC_BACKEND_URL no definido en .env");
  process.exit(1);
}

/**
 * GET /api/suppliersAuth/:id/auth
 *   Redirige al usuario a AliExpress para que autorice tu app.
 */
router.get("/:id/auth", async (req, res) => {
  try {
    const supplierId = Number(req.params.id);
    const { rows } = await pool.query(
      "SELECT config, admin_url FROM suppliers WHERE id = $1",
      [supplierId]
    );
    const sup = rows[0];
    if (!sup) return res.status(404).send("Proveedor no encontrado");

    // config debe ser un JSON, no un “[object Object]”
    const cfg = sup.config || {};
    if (!cfg.appKey) {
      return res.status(400).send("Falta configurar appKey en el proveedor");
    }

    const redirectUri = encodeURIComponent(
      `${process.env.PUBLIC_BACKEND_URL}/api/suppliersAuth/${supplierId}/auth/callback`
    );

    const oauthUrl =
      `${ALI_AUTH_URL}` +
      `?client_id=${encodeURIComponent(cfg.appKey)}` +
      `&redirect_uri=${redirectUri}` +
      `&site=aliexpress`;

    return res.redirect(oauthUrl);
  } catch (err) {
    console.error("Error iniciando OAuth:", err);
    return res.status(500).send("Error iniciando OAuth");
  }
});

/**
 * GET /api/suppliersAuth/:id/auth/callback
 *   Aquí AliExpress retorna ?code=… y tú intercambiaslo por token.
 */
router.get("/:id/auth/callback", async (req, res) => {
  const supplierId = Number(req.params.id);
  const { code } = req.query;
  if (!code) return res.status(400).send("Falta parámetro code");

  try {
    const { rows } = await pool.query(
      "SELECT config, admin_url FROM suppliers WHERE id = $1",
      [supplierId]
    );
    const sup = rows[0];
    if (!sup) return res.status(404).send("Proveedor no encontrado");

    const cfg = sup.config || {};
    if (!cfg.appKey || !cfg.appSecret) {
      return res.status(400).send("Falta appKey/appSecret en el proveedor");
    }

    // Intercambia el code por token
    const tokenRes = await axios.get(ALI_TOKEN_URL, {
      params: {
        client_id:     cfg.appKey,
        client_secret: cfg.appSecret,
        grant_type:    "authorization_code",
        code:          code,
      }
    });

    // Guarda el tokenData dentro de config (tipo JSONB)
    const tokenData = tokenRes.data;
    const newConfig = { ...cfg, tokenData };
    await pool.query(
      "UPDATE suppliers SET config = $1 WHERE id = $2",
      [newConfig, supplierId]
    );

    // Redirige al panel de admin si tienes admin_url
    return res.redirect(sup.admin_url || "/");
  } catch (err) {
    console.error("Error intercambiando token OAuth:", err);
    return res.status(500).send("Error intercambiando token");
  }
});

module.exports = router;
