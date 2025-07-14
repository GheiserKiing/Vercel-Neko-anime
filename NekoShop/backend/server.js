// File: NekoShop/backend/server.js

require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const path    = require("path");
const fs      = require("fs");

// Tu conexión a PostgreSQL
const pool = require("./db-postgres");

const app = express();

// ─── CORS ────────────────────────────────────────────────────────────────
// CLIENT_ORIGIN = "http://localhost:3000"
// FRONTEND_URL = "https://neko-shop-frontend.vercel.app,https://otro-preview.vercel.app"
const clientOrigin = process.env.CLIENT_ORIGIN || "";
const rawFrontends = process.env.FRONTEND_URL    || "";
const frontendOrigins = rawFrontends
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

const allowedOrigins = [ clientOrigin, ...frontendOrigins ]
  .filter(Boolean);

console.log("🔑 Allowed CORS origins:", allowedOrigins);

app.use(cors({
  origin(origin, callback) {
    // 1) Sin origin (Postman, server-to-server): OK
    // 2) Origin exactamente en allowedOrigins: OK
    // 3) Origin termina en ".vercel.app": OK (producción + previews)
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      origin.endsWith(".vercel.app")
    ) {
      return callback(null, true);
    }
    callback(new Error(`CORS policy: origin ${origin} not allowed`));
  }
}));

// ─── Middlewares ─────────────────────────────────────────────────────────
app.use(express.json());

// Carpeta estática para imágenes subidas
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use("/uploads", express.static(uploadDir));

// ─── Health checks ────────────────────────────────────────────────────────
app.get("/healthz", (_req, res) => res.json({ status: "ok" }));
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// ─── Rutas ────────────────────────────────────────────────────────────────
app.use("/api/login",           require("./routes/auth"));
app.use("/",                     require("./routes/suppliersAuth"));
app.use("/api/suppliers",       require("./routes/suppliers"));
app.use("/api/products",        require("./routes/products"));
app.use("/api/categories",      require("./routes/categories"));
app.use("/api/orders",          require("./routes/orders"));
app.use("/api/metrics",         require("./routes/metrics"));
app.use("/api/bulk",            require("./routes/bulk"));
app.use("/api/settings",        require("./routes/settings"));
app.use("/api/payments",        require("./routes/payments"));
app.use("/api/dropship",        require("./routes/dropship"));
app.use("/api/messages",        require("./routes/messages"));
app.use("/api/email-logs",      require("./routes/emailLogs"));
app.use("/api/email-templates", require("./routes/emailTemplates"));
app.use("/api/newsletter",      require("./routes/newsletter"));
app.use("/api/upload",          require("./routes/uploadImage"));

// ─── 404 + Error handler ──────────────────────────────────────────────────
app.use((_, res) => res.status(404).json({ error: "Endpoint not found" }));
app.use((err, _, res, __) => {
  console.error("🔥 Error:", err.stack || err);
  res.status(err.status || 500).json({ error: err.message || "Server Error" });
});

// ─── Levantar servidor ────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Backend listening on port ${PORT}`));
