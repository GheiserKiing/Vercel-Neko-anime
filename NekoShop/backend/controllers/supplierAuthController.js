// File: NekoShop/backend/controllers/supplierAuthController.js
const { buildAuthUrl, exchangeCodeForToken } = require('../services/supplierAuthService');

async function redirectToAliExpress(req, res) {
  const supplierId = parseInt(req.params.id, 10);
  const url = buildAuthUrl(supplierId);
  res.json({ oauthUrl: url });
}

async function handleCallback(req, res) {
  const { code, state } = req.query;
  if (!code) return res.status(400).send('No code provided');
  const supplierId = parseInt(state, 10);
  try {
    await exchangeCodeForToken(code, supplierId);
    res.send('✅ AliExpress conectado correctamente');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener token');
  }
}

module.exports = { redirectToAliExpress, handleCallback };
