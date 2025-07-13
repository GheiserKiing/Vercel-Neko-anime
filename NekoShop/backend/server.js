require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');

// Si usas PostgreSQL
const pool = require('./db-postgres');

// Routers
const authRouter           = require('./routes/auth');
const suppliersAuthRouter  = require('./routes/suppliersAuth');
const productsRouter       = require('./routes/products');
const categoriesRouter     = require('./routes/categories');
const ordersRouter         = require('./routes/orders');
const metricsRouter        = require('./routes/metrics');
const bulkRouter           = require('./routes/bulk');
const settingsRouter       = require('./routes/settings');
const paymentsRouter       = require('./routes/payments');
const suppliersRouter      = require('./routes/suppliers');
const dropshipRouter       = require('./routes/dropship');
const messagesRouter       = require('./routes/messages');
const emailLogsRouter      = require('./routes/emailLogs');
const emailTemplatesRouter = require('./routes/emailTemplates');
const newsletterRouter     = require('./routes/newsletter');
const uploadImageRouter    = require('./routes/uploadImage');

const app = express();

// ─── CORS: lista de orígenes permitidos ────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_ORIGIN,  // e.g. http://localhost:3000
  process.env.FRONTEND_URL    // e.g. https://neko-shop-frontend.vercel.app
].filter(Boolean);

console.log('🔑 Allowed CORS origins:', allowedOrigins);

app.use(cors({
  origin(origin, callback) {
    // si no hay origin (curl/Postman) o está en la lista, ok
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // si no, rechazamos
    return callback(new Error(`CORS policy: origin ${origin} no permitido`));
  }
}));

// ─── Middlewares ────────────────────────────────────────────────────────
app.use(express.json());

// ─── Carpeta de estáticos para /uploads ─────────────────────────────────
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// ─── Health check ───────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// ─── Montaje de rutas ──────────────────────────────────────────────────
app.use('/api/login',           authRouter);
app.use('/api/suppliers',       suppliersAuthRouter);
app.use('/api/products',        productsRouter);
app.use('/api/categories',      categoriesRouter);
app.use('/api/orders',          ordersRouter);
app.use('/api/metrics',         metricsRouter);
app.use('/api/bulk',            bulkRouter);
app.use('/api/settings',        settingsRouter);
app.use('/api/payments',        paymentsRouter);
app.use('/api/suppliers',       suppliersRouter);
app.use('/api/dropship',        dropshipRouter);
app.use('/api/messages',        messagesRouter);
app.use('/api/email-logs',      emailLogsRouter);
app.use('/api/email-templates', emailTemplatesRouter);
app.use('/api/newsletter',      newsletterRouter);

// Este router contiene la ruta POST /api/products/:id/images
// si además tienes una ruta genérica de subida la puedes poner en /api/upload
app.use('/api', uploadImageRouter);

// ─── 404 handler ───────────────────────────────────────────────────────
app.use((_, res) => res.status(404).json({ error: 'Endpoint not found' }));

// ─── Error handler ────────────────────────────────────────────────────
app.use((err, _, res, __) => {
  console.error('🔥 Error:', err.stack || err);
  res.status(err.status || 500).json({ error: err.message || 'Server Error' });
});

// ─── Levantar servidor ─────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Backend escuchando en puerto ${PORT}`));
