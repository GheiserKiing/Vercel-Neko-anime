// File: NekoShop/backend/setupDb.js

/**
 * Script para crear las tablas en PostgreSQL
 * Ejecuta: node setupDb.js
 */

const pool = require('./db-postgres');

async function setup() {
  try {
    // Crear tabla categories
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL
      );
    `);

    // Crear tabla subcategories
    await pool.query(`
      CREATE TABLE IF NOT EXISTS subcategories (
        id SERIAL PRIMARY KEY,
        category_id INTEGER NOT NULL
          REFERENCES categories(id)
          ON DELETE CASCADE,
        name TEXT NOT NULL
      );
    `);

    // Crear tabla products
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        sku TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT DEFAULT '',
        price NUMERIC NOT NULL,
        stock INTEGER NOT NULL,
        category_id INTEGER
          REFERENCES categories(id)
          ON DELETE SET NULL,
        subcategory_id INTEGER
          REFERENCES subcategories(id)
          ON DELETE SET NULL,
        images JSONB DEFAULT '[]'::jsonb,
        cover_image_url TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('✅ Tablas creadas correctamente');
  } catch (err) {
    console.error('❌ Error creando tablas:', err);
  } finally {
    await pool.end();
  }
}

setup();
