// File: backend/routes/uploadImage.js

const express      = require('express');
const multer       = require('multer');
const { v2: cloudinary } = require('cloudinary');
const streamifier  = require('streamifier');
require('dotenv').config();

const router = express.Router();

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer en memoria para recibir archivos
const upload = multer({ storage: multer.memoryStorage() });

/**
 * POST /api/upload-image
 * Recibe un campo "image" con el fichero,
 * lo sube a Cloudinary y devuelve { url }.
 */
router.post(
  '/upload-image',
  upload.single('image'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No se recibió ningún fichero bajo "image"' });
      }

      // Sube el buffer directamente a Cloudinary
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'products' },
        (err, result) => {
          if (err) return next(err);
          res.json({ url: result.secure_url });
        }
      );

      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
