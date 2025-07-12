// File: backend/services/emailService.js
const nodemailer   = require("nodemailer");
const sqlite3      = require("sqlite3").verbose();
const path         = require("path");
const Handlebars   = require("handlebars");
require("dotenv").config();

// SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Open DB
const dbPath = path.join(__dirname, "../data/products.db");
const db     = new sqlite3.Database(dbPath, err => {
  if (err) console.error("Error opening DB for emailService:", err);
});

// Log each send
function logEmail({ kind, order_id, recipient, subject, body }) {
  db.run(
    `INSERT INTO email_logs (kind, order_id, recipient, subject, body, sent_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [kind, order_id || null, recipient, subject, body, Math.floor(Date.now()/1000)],
    err => {
      if (err) console.error("❌ Error logging email:", err);
    }
  );
}

// Fetch template
function getTemplate(key) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT subject_template, body_template FROM email_templates WHERE key = ?`,
      [key],
      (err, row) => {
        if (err) return reject(err);
        if (!row) return reject(new Error(`Template '${key}' not found`));
        resolve(row);
      }
    );
  });
}

// Send templated email
async function sendTemplatedEmail(key, context, recipient) {
  const tpl = await getTemplate(key);
  const subject = Handlebars.compile(tpl.subject_template)(context);
  const body    = Handlebars.compile(tpl.body_template)(context);
  await transporter.sendMail({
    from:    process.env.SMTP_USER,
    to:      recipient,
    subject,
    text:    body
  });
  logEmail({ kind: key, order_id: context.order?.id, recipient, subject, body });
}

// Confirmation & supplier notifications
async function sendOrderConfirmation(order, customerEmail) {
  await sendTemplatedEmail("order_confirmation", { order }, customerEmail);
}
async function sendOrderToSupplier(order, supplierEmail) {
  await sendTemplatedEmail("supplier_notification", { order }, supplierEmail);
}

// Welcome email for newsletter
async function sendWelcomeEmail(email) {
  const subject = "¡Bienvenido a la NekoDrops Anime Newsletter!";
  const body = `
Hola,

¡Gracias por suscribirte a nuestra newsletter!
Pronto recibirás nuestras ofertas y noticias otaku.

Saludos,
El equipo de NekoDrops Anime
`.trim();

  await transporter.sendMail({ from: process.env.SMTP_USER, to: email, subject, text: body });
  logEmail({ kind: "newsletter_welcome", recipient: email, subject, body });
}

module.exports = {
  sendOrderConfirmation,
  sendOrderToSupplier,
  sendWelcomeEmail,
};
