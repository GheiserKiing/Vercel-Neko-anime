// File: NekoShop/backend/routes/uploadImage.js
const express     = require('express');
const multer      = require('multer');
const streamifier = require('streamifier');
const cloudinary  = require('../config/cloudinary');

const router = express.Router();
const upload = multer(); // sin storage local

// POST /api/upload
router.post('/upload', upload.single('image'), (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se envió ninguna imagen' });
  }

  const stream = cloudinary.uploader.upload_stream(
    { folder: 'neko-shop' },
    (error, result) => {
      if (error) return next(error);
      res.json({ url: result.secure_url });
    }
  );

  streamifier.createReadStream(req.file.buffer).pipe(stream);
});

module.exports = router;
