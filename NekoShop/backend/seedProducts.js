// File: backend/seedProducts.js

require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.PGHOST,      // este cambio es para conectar con PGHOST
  port: process.env.PGPORT,      // este cambio es para conectar con PGPORT
  user: process.env.PGUSER,      // este cambio es para conectar con PGUSER
  password: process.env.PGPASSWORD,// este cambio es para conectar con PGPASSWORD
  database: process.env.PGDATABASE // este cambio es para conectar con PGDATABASE
});

async function seed() {
  try {
    // Crear tabla si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,                          -- este cambio es para autoincrementar id
        name VARCHAR(100) NOT NULL,                     -- este cambio es para definir nombre
        price NUMERIC(10,2) NOT NULL,                   -- este cambio es para definir precio
        image_url TEXT NOT NULL,                        -- este cambio es para definir URL de imagen
        category VARCHAR(50) NOT NULL,                  -- este cambio es para definir categoría
        description TEXT                                -- este cambio es para definir descripción
      );
    `);

    // Limpiar tabla y reiniciar id
    await pool.query(`TRUNCATE TABLE products RESTART IDENTITY;  -- este cambio es para vaciar antes de sembrar`);

    // Insertar productos de ejemplo
    const samples = [
      {
        name: "Figura de Goku Ultra Instinto",
        price: 49.99,
        image_url: "https://cdn.tutienda.com/images/goku-ultra.jpg",
        category: "figuras",
        description: "Figura articulada de Goku en su forma Ultra Instinto."
      },
      {
        name: "Manga One Piece Vol. 1",
        price: 7.50,
        image_url: "https://cdn.tutienda.com/images/onepiece-v1.jpg",
        category: "manga",
        description: "Primer volumen de One Piece, historia de Luffy."
      },
      {
        name: "Llaveros OtakuPack",
        price: 12.00,
        image_url: "https://cdn.tutienda.com/images/otakupack-llaveros.jpg",
        category: "accesorios",
        description: "Pack de 5 llaveros con personajes de anime."
      }
    ];

    for (const p of samples) {
      await pool.query(
        `INSERT INTO products (name, price, image_url, category, description)
         VALUES ($1, $2, $3, $4, $5);`,
        [p.name, p.price, p.image_url, p.category, p.description]
      );                                              // este cambio es para insertar cada producto
    }

    console.log("👌 Tabla 'products' lista con datos de ejemplo.");
  } catch (err) {
    console.error("❌ Error al sembrar productos:", err);
  } finally {
    await pool.end();                                // este cambio es para cerrar la conexión
  }
}

seed();
