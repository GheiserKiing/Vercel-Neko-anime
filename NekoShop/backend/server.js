// File: NekoShop/backend/server.js

require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const path    = require("path");
const fs      = require("fs");

// PostgreSQL pool (o tu conexión)
const pool = require("./db-postgres");

const app = express();

// ─── CORS ────────────────────────────────────────────────────────────────
// Leemos CLIENT_ORIGIN (local) y FRONTEND_URL (producción, puede tener varios separados por coma)
const clientOrigin   = process.env.CLIENT_ORIGIN;             // e.g. http://localhost:3000
const rawFrontends   = process.env.FRONTEND_URL || "";        // e.g. "https://dom1,https://dom2"
const frontendOrigins = rawFrontends
  .split(",")                         // parte por comas
  .map(s => s.trim())                 // quita espacios y saltos
  .filter(Boolean);                   // elimina cadenas vacías

const allowedOrigins = [ clientOrigin, ...frontendOrigins ]
  .filter(Boolean);

console.log("🔑 Allowed CORS origins:", allowedOrigins);

app.use(cors({
  origin(origin, callback) {
    // Si no viene origin (Postman, server-to-server) o está en la lista → OK
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Si no está permitido, devolvemos error de CORS
    callback(new Error(`CORS policy: origin ${origin} not allowed`));
  }
}));

// ─── Middlewares ─────────────────────────────────────────────────────────
app.use(express.json());

// Carpeta estática para uploads
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use("/uploads", express.static(uploadDir));

// ─── Health checks ────────────────────────────────────────────────────────
// Render-friendly
app.get("/healthz", (_req, res) => res.json({ status: "ok" }));
// Compatibilidad local
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// ─── Montaje de rutas ─────────────────────────────────────────────────────
// Login / auth
app.use("/api/login",           require("./routes/auth"));
// AliExpress OAuth (si lo tienes así)
app.use("/",                    require("./routes/suppliersAuth"));
// API principal
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
