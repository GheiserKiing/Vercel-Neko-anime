// File: NekoShop/backend/seed.js

/**
 * Script para poblar categorías, subcategorías y productos en PostgreSQL.
 * Ejecuta: node seed.js
 */

const pool = require('./db-postgres');

async function seed() {
  try {
    // 1) Categorías de ejemplo
    const categories = ['Figuras', 'Manga', 'Accesorios'];
    for (const name of categories) {
      await pool.query(
        'INSERT INTO categories(name) VALUES($1) ON CONFLICT DO NOTHING',
        [name]
      );
    }

    // 2) Subcategorías de ejemplo
    const subcategories = [
      { cat: 'Figuras', name: 'Anime' },
      { cat: 'Figuras', name: 'Videojuegos' },
      { cat: 'Manga',   name: 'Shonen' }
    ];
    for (const { cat, name } of subcategories) {
      const { rows } = await pool.query(
        'SELECT id FROM categories WHERE name=$1',
        [cat]
      );
      const category_id = rows[0].id;
      await pool.query(
        'INSERT INTO subcategories(category_id,name) VALUES($1,$2) ON CONFLICT DO NOTHING',
        [category_id, name]
      );
    }

    // 3) Productos de ejemplo
    const products = [
      { sku: 'FIG001', name: 'Figura Goku',     price: 25.5, stock: 10, cat: 'Figuras', sub: 'Anime' },
      { sku: 'MAN001', name: 'One Piece Vol.1', price:  6.99, stock: 50, cat: 'Manga',   sub: 'Shonen' }
    ];
    for (const p of products) {
      const { rows: cr } = await pool.query(
        'SELECT id FROM categories WHERE name=$1',
        [p.cat]
      );
      const category_id = cr[0].id;
      const { rows: sr } = await pool.query(
        'SELECT id FROM subcategories WHERE name=$1 AND category_id=$2',
        [p.sub, category_id]
      );
      const subcategory_id = sr[0].id;
      await pool.query(
        `INSERT INTO products
           (sku,name,description,price,stock,category_id,subcategory_id,images,cover_image_url)
         VALUES
           ($1,$2,'', $3, $4, $5, $6, '[]', NULL)
         ON CONFLICT DO NOTHING`,
        [p.sku, p.name, p.price, p.stock, category_id, subcategory_id]
      );
    }

    console.log('✅ Seed completado');
  } catch (err) {
    console.error('❌ Error en seed:', err);
  } finally {
    await pool.end();
  }
}

seed();
