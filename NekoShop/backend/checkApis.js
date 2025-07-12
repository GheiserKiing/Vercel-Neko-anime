// File: backend/checkApis.js

const fetch = require("node-fetch");

(async () => {
  const paths = [
    "/api/products",
    "/api/orders",
    "/api/metrics/sales-by-day",
    "/api/metrics/top-products"
  ];
  for (const p of paths) {
    try {
      const res = await fetch(`http://localhost:4000${p}`);
      const json = await res.json();
      console.log(`${p} → ${res.status}`, Array.isArray(json) ? `(${json.length} items)` : json);
    } catch (e) {
      console.error(`${p} → ERROR`, e.message);
    }
  }
})();
