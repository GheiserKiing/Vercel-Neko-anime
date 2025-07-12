// File: backend/routes/payments.js

const express          = require("express");
const { PayPalClient } = require("../services/paypal");
const router           = express.Router();

// 1) Crear orden PayPal
// POST /api/payments/paypal/create
// Body: { total: "10.00" }
router.post("/paypal/create", async (req, res, next) => {
  try {
    const { total } = req.body;
    const request   = PayPalClient.buildRequest("create", { total });
    const order     = await PayPalClient.execute(request);
    res.json({ orderID: order.result.id });
  } catch (err) {
    next(err);
  }
});

// 2) Capturar orden PayPal
// POST /api/payments/paypal/capture
// Body: { orderID: "..." }
router.post("/paypal/capture", async (req, res, next) => {
  try {
    const { orderID } = req.body;
    const request     = PayPalClient.buildRequest("capture", { orderID });
    const capture     = await PayPalClient.execute(request);
    res.json({ status: capture.result.status });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
