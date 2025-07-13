require("dotenv").config(); // para PUBLIC_BACKEND_URL
const express       = require("express");
const axios         = require("axios");
const path          = require("path");
const sqlite3       = require("sqlite3").verbose();
const { promisify } = require("util");

const router   = express.Router();
const dbPath   = path.join(__dirname, "../data/products.db");
const db       = new sqlite3.Database(dbPath);
const getAsync = promisify(db.get.bind(db));
const runAsync = promisify(db.run.bind(db));

const ALI_AUTH_URL  = "https://gw.api.alibaba.com/auth/authorize.htm";
const ALI_TOKEN_URL = "https://gw.api.alibaba.com/openapi/http/1/system.oauth2/getToken";

if (!process.env.PUBLIC_BACKEND_URL) {
  console.error("🔴 PUBLIC_BACKEND_URL no definido en .env");
  process.exit(1);
}

/** GET /api/suppliers/:id/auth — Iniciar OAuth AliExpress */
router.get("/:id/auth", async (req, res) => {
  try {
    const supplierId = Number(req.params.id);
    const sup = await getAsync("SELECT * FROM suppliers WHERE id=?", [supplierId]);
    if (!sup) return res.status(404).send("Proveedor no encontrado");
    const cfg = JSON.parse(sup.config||"{}");
    if (!cfg.appKey) {
      return res.status(400).send("Falta appKey en config");
    }
    const redirect = encodeURIComponent(
      `${process.env.PUBLIC_BACKEND_URL}/api/suppliers/${supplierId}/auth/callback`
    );
    const oauthUrl = `${ALI_AUTH_URL}?client_id=${encodeURIComponent(cfg.appKey)}&redirect_uri=${redirect}&site=aliexpress`;
    res.redirect(oauthUrl);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error iniciando OAuth");
  }
});

/** GET /api/suppliers/:id/auth/callback — Callback OAuth */
router.get("/:id/auth/callback", async (req, res) => {
  const supplierId = Number(req.params.id);
  const { code }   = req.query;
  if (!code) return res.status(400).send("Falta parámetro code");
  try {
    const sup = await getAsync("SELECT * FROM suppliers WHERE id=?", [supplierId]);
    if (!sup) return res.status(404).send("Proveedor no encontrado");
    const cfg = JSON.parse(sup.config||"{}");
    if (!cfg.appKey || !cfg.appSecret) {
      return res.status(400).send("Falta appKey/appSecret en config");
    }
    const tokenRes = await axios.get(ALI_TOKEN_URL, {
      params: {
        client_id:     cfg.appKey,
        client_secret: cfg.appSecret,
        grant_type:    "authorization_code",
        code:          code
      }
    });
    const tokenData = tokenRes.data;
    await runAsync(
      "UPDATE suppliers SET config=? WHERE id=?;",
      [JSON.stringify({ ...cfg, tokenData }), supplierId]
    );
    res.redirect(sup.adminUrl || "/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error intercambiando token");
  }
});

module.exports = router;
