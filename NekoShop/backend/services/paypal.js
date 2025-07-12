// File: backend/services/paypal.js

const checkout = require("@paypal/checkout-server-sdk");

// 1) Configura entorno sandbox o live
function environment() {
  if (process.env.NODE_ENV === "production") {
    return new checkout.core.LiveEnvironment(
      process.env.PAYPAL_CLIENT_ID,
      process.env.PAYPAL_CLIENT_SECRET
    );
  }
  return new checkout.core.SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  );
}

// 2) Crea cliente
const client = new checkout.core.PayPalHttpClient(environment());

// 3) Exporta funciones
module.exports.PayPalClient = {
  execute(request) {
    return client.execute(request);
  },
  buildRequest(type, { total, orderID }) {
    if (type === "create") {
      const req = new checkout.orders.OrdersCreateRequest();
      req.requestBody({
        intent: "CAPTURE",
        purchase_units: [{ amount: { currency_code: "EUR", value: total } }]
      });
      return req;
    } else {
      const req = new checkout.orders.OrdersCaptureRequest(orderID);
      req.requestBody({});
      return req;
    }
  }
};
