// File: NekoShop/backend/routes/settings.js

const express     = require("express");
const path        = require("path");
const fs          = require("fs");
const multer      = require("multer");
const cloudinary  = require("../config/cloudinary"); // tu config de Cloudinary
const router      = express.Router();

const dataDir      = path.join(__dirname, "../data");
const settingsFile = path.join(dataDir, "settings.json");

// 1) Aseguramos carpeta y archivo JSON de ajustes
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

// 2) Multer en memoria para obtener buffer
const upload = multer({ storage: multer.memoryStorage() });

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

/**
 * POST /api/settings/heroImage
 * Recibe el campo 'hero' (file), lo sube a Cloudinary y devuelve su secure_url.
 */
router.post(
  "/heroImage",
  upload.single("hero"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No se subió archivo" });
    }
    // Subimos buffer a Cloudinary vía stream
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "nekoshop/heroes" },
      (error, result) => {
        if (error) {
          console.error("Cloudinary error:", error);
          return res.status(500).json({ error: error.message });
        }
        // Respondemos la URL pública
        res.json({ url: result.secure_url });
      }
    );
    uploadStream.end(req.file.buffer);
  }
);

module.exports = router;
