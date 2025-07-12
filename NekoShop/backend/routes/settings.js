// File: backend/routes/settings.js

const express = require("express");
const path    = require("path");
const fs      = require("fs");
const multer  = require("multer");
const router  = express.Router();

const dataDir = path.join(__dirname, "../data");
const settingsFile = path.join(dataDir, "settings.json");

// 1) Aseguramos carpeta y JSON de ajustes
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(settingsFile)) {
  fs.writeFileSync(settingsFile, JSON.stringify({
    siteSettings: {
      heroText: "",
      heroSubtext: "",
      heroImageUrl: "/images/hero.jpg",
      dailyProductId: "",
      categoryHeroes: {}
    }
  }, null, 2));
}

// 2) Configuración de multer para subir imágenes a /uploads
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// GET /api/settings
router.get("/", (_req, res) => {
  try {
    const raw = fs.readFileSync(settingsFile, "utf-8");
    res.json(JSON.parse(raw));
  } catch (err) {
    res.status(500).json({ error: "Error leyendo ajustes" });
  }
});

// PUT /api/settings
router.put("/", express.json(), (req, res) => {
  try {
    fs.writeFileSync(settingsFile, JSON.stringify(req.body, null, 2));
    res.json(req.body);
  } catch (err) {
    res.status(500).json({ error: "Error guardando ajustes" });
  }
});

// POST /api/settings/heroImage
router.post("/heroImage", upload.single("hero"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No se subió archivo" });
  const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.json({ url });
});

module.exports = router;
