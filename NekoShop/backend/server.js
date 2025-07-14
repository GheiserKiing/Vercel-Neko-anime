require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const path    = require("path");
const fs      = require("fs");

// — Conexión PostgreSQL por DATABASE_URL
const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Routers
const authRouter           = require("./routes/auth");
const suppliersAuthRouter  = require("./routes/suppliersAuth");  // ya no va en "/"
const productsRouter       = require("./routes/products");
const categoriesRouter     = require("./routes/categories");
const ordersRouter         = require("./routes/orders");
const metricsRouter        = require("./routes/metrics");
const bulkRouter           = require("./routes/bulk");
const settingsRouter       = require("./routes/settings");
const paymentsRouter       = require("./routes/payments");
const suppliersRouter      = require("./routes/suppliers");
const dropshipRouter       = require("./routes/dropship");
const messagesRouter       = require("./routes/messages");
const emailLogsRouter      = require("./routes/emailLogs");
const emailTemplatesRouter = require("./routes/emailTemplates");
const newsletterRouter     = require("./routes/newsletter");
const uploadImageRouter    = require("./routes/uploadImage");

const app = express();

// — CORS dinámico
const clientOrigin = process.env.CLIENT_ORIGIN;
const frontendOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

const allowedOrigins = [clientOrigin, ...frontendOrigins].filter(Boolean);
console.log("🔑 Allowed CORS origins:", allowedOrigins);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
      return callback(null, true);
    }
    callback(new Error(`CORS policy: origin ${origin} not allowed`));
  }
}));

app.use(express.json());

// Carpeta de assets subidos
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use("/uploads", express.static(uploadDir));

// Health checks
app.get("/healthz", (_req, res) => res.json({ status: "ok" }));
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// Rutas
app.use("/api/login",           authRouter);
app.use("/api/suppliersAuth",   suppliersAuthRouter);  // cambia el mount path
app.use("/api/suppliers",       suppliersRouter);
app.use("/api/products",        productsRouter);
app.use("/api/categories",      categoriesRouter);
app.use("/api/orders",          ordersRouter);
app.use("/api/metrics",         metricsRouter);
app.use("/api/bulk",            bulkRouter);
app.use("/api/settings",        settingsRouter);
app.use("/api/payments",        paymentsRouter);
app.use("/api/dropship",        dropshipRouter);
app.use("/api/messages",        messagesRouter);
app.use("/api/email-logs",      emailLogsRouter);
app.use("/api/email-templates", emailTemplatesRouter);
app.use("/api/newsletter",      newsletterRouter);
app.use("/api/upload",          uploadImageRouter);

// 404 + error handler
app.use((_, res) => res.status(404).json({ error: "Endpoint not found" }));
app.use((err, _, res, __) => {
  console.error("🔥 Error:", err.stack || err);
  res.status(err.status || 500).json({ error: err.message || "Server Error" });
});

const PORT = parseInt(process.env.PORT, 10) || 4000;
app.listen(PORT, () => console.log(`🚀 Backend listening on port ${PORT}`));
