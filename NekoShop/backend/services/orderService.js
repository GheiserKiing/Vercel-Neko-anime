// File: backend/services/orderService.js
require("dotenv").config();
const nodemailer = require("nodemailer");
const axios     = require("axios");
const sqlite3   = require("sqlite3").verbose();
const path      = require("path");

// Ruta a la misma DB de productos/pedidos
const dbFile = path.join(__dirname, "../data/products.db");

// 1A) Email
async function sendEmailNotification(order) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: +process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const text = `
Has recibido un nuevo pedido:
Pedido #${order.id}
Cliente: ${order.customer_name} (${order.customer_email})
Dirección: ${order.shipping_address}
Total: €${order.total.toFixed(2)}
  `;

  const info = await transporter.sendMail({
    from: `"NekoShop" <no-reply@nekoshop.com>`,
    to: process.env.SUPPLIER_EMAIL,     // define en tu .env
    subject: `Nuevo pedido #${order.id}`,
    text,
  });

  await logMessage({
    direction: "out",
    type: "email",
    to: process.env.SUPPLIER_EMAIL,
    subject: `Nuevo pedido #${order.id}`,
    body: text,
  });

  return info.messageId;
}

// 1B) POST a API del proveedor
async function sendApiNotification(order) {
  const apiUrl = process.env.SUPPLIER_API_ENDPOINT; // define en tu .env

  await axios.post(apiUrl, { order });

  await logMessage({
    direction: "out",
    type: "api",
    to: apiUrl,
    subject: `Nuevo pedido #${order.id}`,
    body: JSON.stringify(order),
  });

  return true;
}

// 1C) Registro en tabla messages
function logMessage({ direction, type, to, subject, body }) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbFile);
    db.run(
      `INSERT INTO messages
         (direction, type, recipient, subject, body)
       VALUES (?, ?, ?, ?, ?);`,
      [direction, type, to, subject, body],
      function(err) {
        db.close();
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
}

// 1D) Función principal que invocas desde orders.js
async function notifySupplier(order) {
  console.log("🔔 notifySupplier invocado con pedido:", order.id);
  // envía email y API, ambas (o solo la que prefieras)
  await sendEmailNotification(order);
  await sendApiNotification(order);
  console.log("✅ Notificaciones al proveedor completadas");
}

module.exports = { notifySupplier };
