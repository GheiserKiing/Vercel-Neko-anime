const fetch = require("node-fetch");

async function fetchProducts(config) {
  const { apiKey, feedUrl } = config;
  const res = await fetch(feedUrl, {
    headers: { "X-API-KEY": apiKey }
  });
  const data = await res.json();
  return data.map(item => ({
    id: item.sku,
    title: item.title,
    description: item.description,
    price: item.price,
    stock: item.stock,
    imageUrl: item.image_url
  }));
}

module.exports = { fetchProducts };
