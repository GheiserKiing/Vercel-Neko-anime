const fetch = require("node-fetch");
const BASE = "https://api.cjdropshipping.com";

async function fetchProducts(config) {
  const { apiKey, apiSecret } = config;
  let page = 1;
  const perPage = 50;
  const all = [];
  while (true) {
    const res = await fetch(
      `${BASE}/product/list?page=${page}&per_page=${perPage}`,
      {
        method: "POST",
        body: JSON.stringify({ apiKey, apiSecret }),
        headers: { "Content-Type": "application/json" }
      }
    );
    const json = await res.json();
    const data = json.data || [];
    if (data.length === 0) break;
    data.forEach(item => {
      all.push({
        id: item.productId,
        title: item.name,
        description: item.description,
        price: item.price,
        stock: item.inventory,
        imageUrl: item.imageUrl
      });
    });
    page++;
  }
  return all;
}

module.exports = { fetchProducts };
