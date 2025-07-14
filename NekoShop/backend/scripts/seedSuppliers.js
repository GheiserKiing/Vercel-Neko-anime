// File: NekoShop/backend/scripts/seedSuppliers.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // si tu Render Postgres lo requiere
});

(async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const insertText = `
      INSERT INTO suppliers (name, adminUrl, config)
      VALUES ($1, $2, $3)
      RETURNING id;
    `;
    const insertValues = [
      'Mi AliExpress Anime',
      'https://neko-shop-frontend.vercel.app/admin',  // ajusta si quieres otra URL de admin
      JSON.stringify({
        appKey:    '516566',
        appSecret: 'jUxo7cxQ3DKXExEX0vIaGuBdoLpxXONE'
      })
    ];
    const res = await client.query(insertText, insertValues);
    console.log(`✅ Supplier creado con id = ${res.rows[0].id}`);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('🛑 Error en seedSuppliers:', err);
  } finally {
    client.release();
    await pool.end();
  }
})();
