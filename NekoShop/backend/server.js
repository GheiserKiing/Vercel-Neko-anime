// File: NekoShop/backend/server.js

require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const path      = require('path');
const fs        = require('fs');

// Importa pool de Postgres
const pool      = require('./db-postgres');

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
// Nueva ruta de subida (solo aquí)
const uploadImageRouter    = require('./routes/uploadImage');

const app = express();

// Asegura carpeta uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Middlewares
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000' }));
app.use(
  '/uploads',
  (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_ORIGIN || 'http://localhost:3000');
    next();
  },
  express.static(uploadDir)
);

// Ruta de salud: prueba esto primero
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Monta routers de API *antes* de la ruta de subida
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
app.use('/api/messages',        messagesRouter);
app.use('/api/email-logs',      emailLogsRouter);
app.use('/api/email-templates', emailTemplatesRouter);
app.use('/api/newsletter',      newsletterRouter);

// **Solo** la subida de imágenes en /api/upload
app.use('/api/upload', uploadImageRouter);

// 404 y error handler
app.use((_, res) => res.status(404).json({ error: 'Endpoint not found' }));
app.use((err, _, res, __) => {
  console.error('🔥 Error:', err.stack || err);
  res.status(err.status || 500).json({ error: err.message || 'Server Error' });
});

// Arranque
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Backend escuchando en puerto ${PORT}`));
