// File: backend/routes/bulk.js

const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse");
const sqlite3 = require("sqlite3").verbose();
const { promisify } = require("util");

// Conectar a la misma base de datos
const dbPath = path.join(__dirname, "../data/products.db");
const db     = new sqlite3.Database(dbPath);
const runAsync = promisify(db.run.bind(db));

module.exports = async function (req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se recibió ningún archivo" });
    }

    const filePath = path.join(__dirname, "../uploads", req.file.filename);
    const parser = fs
      .createReadStream(filePath)
      .pipe(parse({ columns: true, skip_empty_lines: true, trim: true }));

    let inserted = 0;
    const errors = [];

    for await (const record of parser) {
      const {
        sku,
        name,
        price,
        stock,
        category,
        subcategory,
        description,
        cover_image,
        image_url
      } = record;

      if (!name || !price || !category) {
        errors.push({ record, error: "Faltan name, price o category" });
        continue;
      }

      try {
        const imgUrl = image_url || "";
        await runAsync(`
          INSERT INTO products (
            sku, name, price, stock,
            category, subcategory, description,
            cover_image, image_url
          ) VALUES (
            ${sku ? `'${sku.replace(/'/g, "''")}'` : "NULL"},
            '${name.replace(/'/g, "''")}',
            ${parseFloat(price)},
            ${stock ? Number(stock) : 0},
            '${category.replace(/'/g, "''")}',
            ${subcategory ? `'${subcategory.replace(/'/g, "''")}'` : "NULL"},
            ${description ? `'${description.replace(/'/g, "''")}'` : "NULL"},
            ${cover_image ? `'${cover_image.replace(/'/g, "''")}'` : "NULL"},
            '${imgUrl}'
          );
        `);
        inserted++;
      } catch (e) {
        errors.push({ record, error: e.message });
      }
    }

    // Borra el CSV subido
    fs.unlinkSync(filePath);

    res.json({ inserted, errors, total: inserted + errors.length });
  } catch (err) {
    console.error("Error en bulk-upload:", err);
    res.status(500).json({ error: "Error al procesar CSV" });
  }
};
