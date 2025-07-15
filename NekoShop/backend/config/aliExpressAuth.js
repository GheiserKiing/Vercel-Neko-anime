// File: NekoShop/backend/config/aliExpressAuth.js
// ──────────────────────────────────────────────────────────────────────────────
// Configuración de OAuth AliExpress

module.exports = {
  // URL de autorización (login)
  authUrl: "https://gw.api.alibaba.com/auth/authorize.htm",

  // URL para intercambiar code por token
  tokenUrl: "https://gw.api.alibaba.com/openapi/http/1/system.oauth2/getToken",

  /**
   * Genera la URI de callback completa para un supplier dado.
   * supplierId: número de proveedor en tu tabla `suppliers`
   */
  getRedirectUri: (supplierId) =>
    `${process.env.PUBLIC_BACKEND_URL}/api/suppliersAuth/${supplierId}/auth/callback`
};
