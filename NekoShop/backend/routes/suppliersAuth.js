// File: NekoShop/backend/routes/suppliersAuth.js
require("dotenv").config();
const express = require("express");
const axios   = require("axios");
const pool    = require("../db-postgres");
const { authUrl, tokenUrl, getRedirectUri } = require("../config/aliExpressAuth");
const router  = express.Router();

// 1) Iniciar OAuth
// GET /api/suppliersAuth/:id/auth
router.get("/:id/auth", async (req, res) => {
  const supplierId = Number(req.params.id);

  // 1.1) Leer config del proveedor en DB
  const { rows } = await pool.query(
    "SELECT config FROM suppliers WHERE id=$1",
    [supplierId]
  );
  if (rows.length === 0) return res.status(404).send("Proveedor no encontrado");

  let cfg = rows[0].config;
  if (typeof cfg === "string") {
    try { cfg = JSON.parse(cfg); }
    catch { return res.status(400).send("config mal formado"); }
  }

  // 1.2) Usar appKey de DB o fallback al .env
  const appKey = cfg.appKey || process.env.ALIEXPRESS_APP_KEY;
  if (!appKey) {
    return res.status(400).send("Falta appKey (ni en DB ni en .env)");
  }

  // 1.3) Construir URL de autorización y redirigir
  const redirectUri = encodeURIComponent(getRedirectUri(supplierId));
  const oauthUrl = `${authUrl}` +
                   `?client_id=${encodeURIComponent(appKey)}` +
                   `&redirect_uri=${redirectUri}` +
                   `&site=aliexpress`;
  res.redirect(oauthUrl);
});

// 2) Callback de OAuth
// GET /api/suppliersAuth/:id/auth/callback
router.get("/:id/auth/callback", async (req, res) => {
  const supplierId = Number(req.params.id);
  const { code } = req.query;
  if (!code) return res.status(400).send("Falta parámetro code");

  // 2.1) Leer config + admin_url de DB
  const { rows } = await pool.query(
    "SELECT config, admin_url FROM suppliers WHERE id=$1",
    [supplierId]
  );
  if (rows.length === 0) return res.status(404).send("Proveedor no encontrado");

  let cfg = rows[0].config;
  if (typeof cfg === "string") {
    try { cfg = JSON.parse(cfg); }
    catch { return res.status(400).send("config mal formado"); }
  }

  // 2.2) Usar appKey/appSecret de DB o fallback al .env
  const appKey    = cfg.appKey    || process.env.ALIEXPRESS_APP_KEY;
  const appSecret = cfg.appSecret || process.env.ALIEXPRESS_APP_SECRET;
  if (!appKey || !appSecret) {
    return res.status(400).send("Falta appKey/appSecret (ni en DB ni en .env)");
  }

  // 2.3) Intercambiar code por token
  try {
    const tokenRes = await axios.get(tokenUrl, {
      params: {
        client_id:     appKey,
        client_secret: appSecret,
        grant_type:    "authorization_code",
        code
      }
    });
    const tokenData = tokenRes.data;

    // 2.4) Guardar token en DB (mezclado con cualquier cfg previo)
    await pool.query(
      "UPDATE suppliers SET config = $1 WHERE id = $2",
      [ { ...cfg, appKey, appSecret, tokenData }, supplierId ]
    );

    // 2.5) Redirigir al adminUrl (o a "/")
    res.redirect(rows[0].admin_url || "/");
  } catch (error) {
    console.error("Error obteniendo token AliExpress:", error.response?.data || error.message);
    res.status(500).send("Error al obtener token de AliExpress");
  }
});

module.exports = router;
