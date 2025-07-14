#!/usr/bin/env node

/**
 * Usage:
 *   node updateSupplierConfig.js <supplierId> <appKey> <appSecret>
 *
 * Ejemplo:
 *   node updateSupplierConfig.js 9 516566 jUxo7cxQ3DKXExEX0vIaGuBdoLpxXONE
 */

const pool = require('../db-postgres');

async function run() {
  const [ , supplierId, appKey, appSecret ] = process.argv;

  if (!supplierId || !appKey || !appSecret) {
    console.error('❌ Uso: node updateSupplierConfig.js <supplierId> <appKey> <appSecret>');
    process.exit(1);
  }

  const config = {
    appKey:    String(appKey),
    appSecret: String(appSecret),
  };

  const res = await pool.query(
    `UPDATE suppliers
        SET config = $1::jsonb
      WHERE id = $2
      RETURNING id, config`,
    [ JSON.stringify(config), Number(supplierId) ]
  );

  if (res.rowCount === 0) {
    console.warn(`⚠️  No existe ningún supplier con id=${supplierId}`);
    process.exit(1);
  }

  console.log('✔️  Supplier config updated:', res.rows[0]);
  process.exit(0);
}

run().catch(err => {
  console.error('🔥 Error actualizando supplier config:', err);
  process.exit(1);
});
