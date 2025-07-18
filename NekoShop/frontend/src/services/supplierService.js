// File: NekoShop/backend/services/supplierAuthService.js
const axios = require('axios');
const db = require('../db-postgres');
const { appKey, appSecret, authorizeUrl, tokenUrl, redirectUri } = require('../config/aliExpressAuth');

function buildAuthUrl(supplierId) {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: appKey,
    redirect_uri: redirectUri,
    state: supplierId.toString(),
    scope: 'read_trade,write_trade'
  });
  return `${authorizeUrl}?${params.toString()}`;
}

async function exchangeCodeForToken(code, supplierId) {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: appKey,
    client_secret: appSecret,
    code,
    redirect_uri: redirectUri
  });
  const { data } = await axios.post(tokenUrl, params);
  await db.query(`
    INSERT INTO supplier_tokens (supplier_id, access_token, refresh_token, expires_at)
    VALUES ($1, $2, $3, NOW() + INTERVAL '${data.expires_in} seconds')
    ON CONFLICT (supplier_id) DO UPDATE
      SET access_token = $2, refresh_token = $3, expires_at = NOW() + INTERVAL '${data.expires_in} seconds'
  `, [supplierId, data.access_token, data.refresh_token]);
  return data;
}

module.exports = { buildAuthUrl, exchangeCodeForToken };
