// File: NekoShop/backend/scripts/resetSuppliers.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

;(async () => {
  const client = await pool.connect();
  try {
    console.log('🔄 Iniciando reset de suppliers...');
    await client.query('BEGIN');
    await client.query('DELETE FROM suppliers;');
    const res = await client.query(
      `INSERT INTO suppliers (name, adminUrl, config)
       VALUES ($1, $2, $3)
       RETURNING id;`,
      [
        'Mi AliExpress Anime',
        'https://neko-shop-frontend.vercel.app/admin',
        JSON.stringify({ appKey: '516566', appSecret: 'jUxo7cxQ3DKXExEX0vIaGuBdoLpxXONE' })
      ]
    );
    console.log('✅ Nuevo supplierId =', res.rows[0].id);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('🛑 Error durante reset:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
})();
