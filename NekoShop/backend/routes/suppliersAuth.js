// File: NekoShop/backend/routes/suppliersAuth.js
const express = require('express');
const router = express.Router();
const { redirectToAliExpress, handleCallback } = require('../controllers/supplierAuthController');

router.get('/:id/auth', redirectToAliExpress);
router.get('/:id/auth/callback', handleCallback);

module.exports = router;
