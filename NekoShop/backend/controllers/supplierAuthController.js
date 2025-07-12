// File: NekoShop/NekoShop/backend/controllers/supplierAuthController.js

require("dotenv").config();
const axios = require("axios");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const { appKey, appSecret, getRedirectUri } = require("../../../config/aliExpressAuth");

// Inicia OAuth en AliExpress
exports.initiateAuth = (req, res) => {
  const { supplierId } = req.params;
  const redirectUri    = getRedirectUri(supplierId);
  const state          = supplierId;

  const authUrl =
    "https://oauth.aliexpress.com/authorize" +
    `?response_type=code` +
    `&app_key=${encodeURIComponent(appKey)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=${encodeURIComponent(state)}`;

  console.log("🔗 OAuth URL:", authUrl);
  res.redirect(authUrl);
};

// Maneja callback y guarda tokens en SQLite
exports.handleCallback = async (req, res) => {
  const { code, state } = req.query;
  const supplierId      = state;

  if (!code) {
    return res.status(400).send("❌ Falta código de autorización");
  }

  try {
    // Intercambia code por tokens
    const { data } = await axios.post(
      "https://oauth.aliexpress.com/token",
      null,
      {
        params: {
          grant_type:    "authorization_code",
          app_key:       appKey,
          client_secret: appSecret,
          code,
          redirect_uri:  getRedirectUri(supplierId)
        }
      }
    );

    const { access_token, refresh_token, expires_in } = data;

    // Guardar tokens y callbackUrl en BD
    const dbPath = path.join(__dirname, "..", "data", "products.db");
    const db = new sqlite3.Database(dbPath);
    const redirectUri = getRedirectUri(supplierId);

    db.run(
      `UPDATE suppliers
         SET config = json_set(
           IFNULL(config, '{}'),
           '$.accessToken', ?,
           '$.refreshToken', ?,
           '$.expiresIn', ?,
           '$.updatedAt', datetime('now')
         ),
         callbackUrl = ?
       WHERE id = ?`,
      [access_token, refresh_token, expires_in, redirectUri, supplierId],
      function(err) {
        if (err) console.error("❌ Error guardando tokens en BD:", err);
        else console.log(`✅ Tokens guardados para supplier ${supplierId}`);
        db.close();
      }
    );

    // Respuesta al cliente
    res.json({
      message:      "✅ Autenticación completada",
      supplierId,
      access_token,
      refresh_token,
      expires_in
    });
  } catch (err) {
    console.error("🔥 Error obteniendo token:", err.response?.data || err.message);
    res.status(500).send("❌ Error interno capturando token");
  }
};
