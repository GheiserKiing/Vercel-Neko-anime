// File: NekoShop/backend/routes/suppliersAuth.js

require("dotenv").config(); // Asegúrate de cargar tus vars de entorno
const express       = require("express");
const axios         = require("axios");
const path          = require("path");
const sqlite3       = require("sqlite3").verbose(); // Si aún lo usas; si ya quitaste SQLite, elimina esas referencias
const { promisify } = require("util");

const router   = express.Router();
// -- Si quitaste sqlite, quita estas 3 líneas y usa tu pool de Postgres en su lugar
const dbPath   = path.join(__dirname, "../data/products.db");
const db       = new sqlite3.Database(dbPath);
const getAsync = promisify(db.get.bind(db));
const runAsync = promisify(db.run.bind(db));

// URLs de AliExpress OAuth
const ALI_AUTH_URL  = "https://gw.api.alibaba.com/auth/authorize.htm";
const ALI_TOKEN_URL = "https://gw.api.alibaba.com/openapi/http/1/system.oauth2/getToken";

// Comprueba que PUBLIC_BACKEND_URL venga en .env
if (!process.env.PUBLIC_BACKEND_URL) {
  console.error("🔴 PUBLIC_BACKEND_URL no definido en .env");
  process.exit(1);
}

/**
 * GET /api/suppliersAuth/:id/auth
 *   → Redirige al login de AliExpress
 */
router.get("/:id/auth", async (req, res) => {
  try {
    const supplierId = Number(req.params.id);
    const sup = await getAsync("SELECT * FROM suppliers WHERE id=?", [supplierId]);
    if (!sup) return res.status(404).send("Proveedor no encontrado");

    // Aquí adaptamos sup.config, que puede venir ya como objeto o como string JSON:
    let cfg;
    if (typeof sup.config === "string") {
      cfg = JSON.parse(sup.config || "{}");
    } else {
      cfg = sup.config || {};
    }

    if (!cfg.appKey) {
      return res.status(400).send("Falta configurar appKey en el proveedor");
    }

    const redirectUri = encodeURIComponent(
      `${process.env.PUBLIC_BACKEND_URL}/api/suppliersAuth/${supplierId}/auth/callback`
    );

    const oauthUrl = `${ALI_AUTH_URL}`
      + `?client_id=${encodeURIComponent(cfg.appKey)}`
      + `&redirect_uri=${redirectUri}`
      + `&site=aliexpress`;

    return res.redirect(oauthUrl);

  } catch (err) {
    console.error("Error iniciando OAuth:", err);
    return res.status(500).send("Error iniciando OAuth");
  }
});

/**
 * GET /api/suppliersAuth/:id/auth/callback
 *   → AliExpress redirige aquí con ?code=
 */
router.get("/:id/auth/callback", async (req, res) => {
  const supplierId = Number(req.params.id);
  const { code }   = req.query;
  if (!code) return res.status(400).send("Falta parámetro code");

  try {
    const sup = await getAsync("SELECT * FROM suppliers WHERE id=?", [supplierId]);
    if (!sup) return res.status(404).send("Proveedor no encontrado");

    let cfg;
    if (typeof sup.config === "string") {
      cfg = JSON.parse(sup.config || "{}");
    } else {
      cfg = sup.config || {};
    }

    if (!cfg.appKey || !cfg.appSecret) {
      return res.status(400).send("Falta appKey/appSecret en el proveedor");
    }

    // Intercambia code por token en AliExpress
    const tokenRes = await axios.get(ALI_TOKEN_URL, {
      params: {
        client_id:     cfg.appKey,
        client_secret: cfg.appSecret,
        grant_type:    "authorization_code",
        code:          code
      }
    });

    const tokenData = tokenRes.data;

    // Guarda token dentro de config (ya objeto). Si tu base es Postgres JSONB, pásalo directo:
    await runAsync(
      "UPDATE suppliers SET config=? WHERE id=?;",
      [ JSON.stringify({ ...cfg, tokenData }), supplierId ]
    );

    // Redirige de vuelta al panel admin (o raíz si no hay)
    return res.redirect(sup.adminUrl || "/");

  } catch (err) {
    console.error("Error intercambiando token OAuth:", err);
    return res.status(500).send("Error intercambiando token");
  }
});

module.exports = router;
