// File: NekoShop/backend/config/aliExpressAuth.js
module.exports = {
  appKey: process.env.ALIEXPRESS_APP_KEY,
  appSecret: process.env.ALIEXPRESS_APP_SECRET,
  redirectUri: `${process.env.PUBLIC_BACKEND_URL}/api/suppliersAuth/9/auth/callback`,
  authorizeUrl: 'https://oauth.aliexpress.com/authorize',
  tokenUrl: 'https://oauth.aliexpress.com/token'
};
