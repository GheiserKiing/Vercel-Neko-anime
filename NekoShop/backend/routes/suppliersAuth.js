// File: NekoShop/backend/routes/suppliersAuth.js
require("dotenv").config();
const express = require("express");
const axios   = require("axios");

const router = express.Router();
// Importa tu pool de Postgres
const pool   = require("../db-postgres");

// URLs de AliExpress OAuth
const ALI_AUTH_URL  = "https://gw.api.alibaba.com/auth/authorize.htm";
const ALI_TOKEN_URL = "https://gw.api.alibaba.com/openapi/http/1/system.oauth2/getToken";

// Debes tener PUBLIC_BACKEND_URL en tu .env
if (!process.env.PUBLIC_BACKEND_URL) {
  console.error("🔴 PUBLIC_BACKEND_URL no definido en .env");
  process.exit(1);
}

/**
 * GET /api/suppliersAuth/:id/auth
 *   ↪ Redirige al login de AliExpress
 */
router.get("/:id/auth", async (req, res) => {
  const supplierId = Number(req.params.id);
  try {
    // Lee del Postgres
    const { rows } = await pool.query(
      "SELECT * FROM suppliers WHERE id = $1",
      [supplierId]
    );
    const sup = rows[0];
    if (!sup) return res.status(404).send("Proveedor no encontrado");

    // sup.config puede ser JSONB (objeto) o string
    let cfg = {};
    if (typeof sup.config === "string") {
      cfg = JSON.parse(sup.config || "{}");
    } else if (typeof sup.config === "object") {
      cfg = sup.config;
    }

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
 *   ↪ AliExpress redirige aquí con ?code=
 */
router.get("/:id/auth/callback", async (req, res) => {
  const supplierId = Number(req.params.id);
  const { code } = req.query;
  if (!code) return res.status(400).send("Falta parámetro code");

  try {
    const { rows } = await pool.query(
      "SELECT * FROM suppliers WHERE id = $1",
      [supplierId]
    );
    const sup = rows[0];
    if (!sup) return res.status(404).send("Proveedor no encontrado");

    let cfg = {};
    if (typeof sup.config === "string") {
      cfg = JSON.parse(sup.config || "{}");
    } else if (typeof sup.config === "object") {
      cfg = sup.config;
    }

    if (!cfg.appKey || !cfg.appSecret) {
      return res.status(400).send("Falta appKey/appSecret en el proveedor");
    }

    // Intercambia code por token
    const tokenRes = await axios.get(ALI_TOKEN_URL, {
      params: {
        client_id:     cfg.appKey,
        client_secret: cfg.appSecret,
        grant_type:    "authorization_code",
        code:          code
      }
    });

    const tokenData = tokenRes.data;
    // Guarda tokenData dentro de config en Postgres
    const newConfig = { ...cfg, tokenData };
    await pool.query(
      "UPDATE suppliers SET config = $1 WHERE id = $2",
      [newConfig, supplierId]
    );

    // Redirige al adminUrl o al raíz
    return res.redirect(sup.adminUrl || "/");
  } catch (err) {
    console.error("Error intercambiando token OAuth:", err);
    return res.status(500).send("Error intercambiando token");
  }
});

module.exports = router;
