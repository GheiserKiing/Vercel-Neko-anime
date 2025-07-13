// File: backend/server.js

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');

// Si usas PostgreSQL
const pool = require('./db-postgres');

// Routers
const authRouter           = require('./routes/auth');
const suppliersAuthRouter  = require('./routes/suppliersAuth');   // OAuth AliExpress
const suppliersRouter      = require('./routes/suppliers');
const productsRouter       = require('./routes/products');
const categoriesRouter     = require('./routes/categories');
const ordersRouter         = require('./routes/orders');
const metricsRouter        = require('./routes/metrics');
const bulkRouter           = require('./routes/bulk');
const settingsRouter       = require('./routes/settings');
const paymentsRouter       = require('./routes/payments');
const dropshipRouter       = require('./routes/dropship');
const messagesRouter       = require('./routes/messages');
const emailLogsRouter      = require('./routes/emailLogs');
const emailTemplatesRouter = require('./routes/emailTemplates');
const newsletterRouter     = require('./routes/newsletter');
const uploadImageRouter    = require('./routes/uploadImage');

const app = express();

// ─── CORS ────────────────────────────────────────────────────────────────
// Sólo permitimos los orígenes que declares en tus env vars:
const allowedOrigins = [
  process.env.CLIENT_ORIGIN,  // ej. http://localhost:3000
  process.env.FRONTEND_URL    // ej. https://neko-shop-frontend.vercel.app
].filter(Boolean);

console.log('🔑 Allowed CORS origins:', allowedOrigins);

app.use(cors({
  origin(origin, callback) {
    // Sin origin (Postman, curl) o en la lista → OK
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Si no, rechazamos
    callback(new Error(`CORS policy: origin ${origin} no permitido`));
  }
}));

// ─── Middlewares ─────────────────────────────────────────────────────────
app.use(express.json());

// Carpeta para subir imágenes (estático)
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use('/uploads', express.static(uploadDir));

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// ─── Montaje de rutas ─────────────────────────────────────────────────────
// Auth / login
app.use('/api/login', authRouter);

// OAuth AliExpress (proveedores)
app.use('/', suppliersAuthRouter);

// Resto de API
app.use('/api/suppliers', suppliersRouter);
app.use('/api/products',   productsRouter);
app.use('/api/categories',  categoriesRouter);
app.use('/api/orders',      ordersRouter);
app.use('/api/metrics',     metricsRouter);
app.use('/api/bulk',        bulkRouter);
app.use('/api/settings',    settingsRouter);
app.use('/api/payments',    paymentsRouter);
app.use('/api/dropship',    dropshipRouter);
app.use('/api/messages',    messagesRouter);
app.use('/api/email-logs',      emailLogsRouter);
app.use('/api/email-templates', emailTemplatesRouter);
app.use('/api/newsletter',      newsletterRouter);
app.use('/api/upload',          uploadImageRouter);

// ─── Manejo de errores ────────────────────────────────────────────────────
// 404 para rutas no encontradas
app.use((_, res) => res.status(404).json({ error: 'Endpoint not found' }));

// Captura de errores
app.use((err, _, res, __) => {
  console.error('🔥 Error:', err.stack || err);
  res.status(err.status || 500).json({ error: err.message || 'Server Error' });
});

// ─── Arranque del servidor ─────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Backend escuchando en puerto ${PORT}`));
