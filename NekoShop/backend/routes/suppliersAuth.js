// File: backend/routes/suppliersAuth.js

require("dotenv").config();                 // Carga PUBLIC_BACKEND_URL
const express        = require("express");
const axios          = require("axios");
const path           = require("path");
const sqlite3        = require("sqlite3").verbose();
const { promisify }  = require("util");

const router   = express.Router();
const dbPath   = path.join(__dirname, "../data/products.db");
const db       = new sqlite3.Database(dbPath);
const getAsync = promisify(db.get.bind(db));
const runAsync = promisify(db.run.bind(db));

// AliExpress OAuth endpoints
const ALI_AUTH_URL  = "https://gw.api.alibaba.com/auth/authorize.htm";
const ALI_TOKEN_URL = "https://gw.api.alibaba.com/openapi/http/1/system.oauth2/getToken";

// Comprueba que PUBLIC_BACKEND_URL esté definida
if (!process.env.PUBLIC_BACKEND_URL) {
  console.error("🔴 Error: debes definir PUBLIC_BACKEND_URL en tu .env");
  process.exit(1);
}

/**
 * Inicia OAuth con AliExpress: redirige al usuario al login de AliExpress.
 * Usa PUBLIC_BACKEND_URL + ruta callback registrada en AliExpress.
 */
router.get("/api/suppliers/:id/auth", async (req, res) => {
  try {
    const supplierId = req.params.id;
    const sup = await getAsync("SELECT * FROM suppliers WHERE id=?", [supplierId]);
    if (!sup) return res.status(404).send("Proveedor no encontrado");

    const cfg = JSON.parse(sup.config || "{}");
    if (!cfg.appKey) {
      return res.status(400).send("Falta configurar appKey en el proveedor");
    }

    // Construye siempre el callback a partir de PUBLIC_BACKEND_URL
    const baseUrl     = process.env.PUBLIC_BACKEND_URL;
    const redirectUri = `${baseUrl}/api/suppliers/${supplierId}/auth/callback`;

    const client  = encodeURIComponent(cfg.appKey);
    const redirect = encodeURIComponent(redirectUri);
    const oauthUrl = `${ALI_AUTH_URL}?client_id=${client}&redirect_uri=${redirect}&site=aliexpress`;

    // Redirige al login de AliExpress
    return res.redirect(oauthUrl);
  } catch (err) {
    console.error("Error iniciando OAuth AliExpress:", err);
    return res.status(500).send("Error iniciando OAuth: " + err.message);
  }
});

/**
 * Callback que AliExpress invoca tras el login exitoso.
 * Recibe ?code=... y lo intercambia por token.
 */
router.get("/api/suppliers/:id/auth/callback", async (req, res) => {
  const supplierId = Number(req.params.id);
  const { code }   = req.query;
  if (!code) return res.status(400).send("Falta parámetro code");

  try {
    const sup = await getAsync("SELECT * FROM suppliers WHERE id=?", [supplierId]);
    if (!sup) return res.status(404).send("Proveedor no encontrado");

    const cfg = JSON.parse(sup.config || "{}");
    if (!cfg.appKey || !cfg.appSecret) {
      return res.status(400).send("Falta configurar appKey/appSecret en el proveedor");
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

    // Guarda token en config
    await runAsync(
      "UPDATE suppliers SET config=? WHERE id=?;",
      [JSON.stringify({ ...cfg, tokenData }), supplierId]
    );

    // Redirige al panel interno del proveedor (adminUrl) o ruta raíz si no está configurado
    return res.redirect(sup.adminUrl || "/");
  } catch (err) {
    console.error("Error intercambiando token OAuth AliExpress:", err);
    return res.status(500).send("Error intercambiando token: " + err.message);
  }
});

module.exports = router;
