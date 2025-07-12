// File: simulateOrder.js
const axios = require("axios");

async function simulate() {
  try {
    // 1) Crear un producto “de prueba”
    const prod = await axios.post("http://localhost:4000/api/products", {
      sku: "TEST-PEDIDO",
      name: "Producto Prueba Pedido",
      price: 5.99,
      stock: 100,
      category_id: 1,
      subcategory_id: null,
      description: "Sólo para simular pedido",
    });
    console.log("✅ Producto creado:", prod.data);

    // 2) Simular un pedido usando ese producto
    const order = await axios.post("http://localhost:4000/api/orders", {
      user_id: 1,
      customer_name: "Cliente Prueba",
      customer_email: "cliente@ejemplo.com",
      shipping_address: "Calle Falsa 123, Ciudad",
      payment_method: "on_delivery",
      items: [
        { product_id: prod.data.id, quantity: 1, price: 5.99 }
      ]
    });
    console.log("✅ Pedido simulado:", order.data);
  } catch (err) {
    console.error("❌ Error en simulación:", err.response?.data || err.message);
  }
}

simulate();
