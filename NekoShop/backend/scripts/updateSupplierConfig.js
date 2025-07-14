// File: NekoShop/backend/scripts/updateSupplierConfig.js

const pool = require('../db-postgres');

async function run() {
  // Leer args: node updateSupplierConfig.js <supplierId> <appKey> <appSecret>
  const [ , , supplierIdArg, appKey, appSecret ] = process.argv;
  const supplierId = Number(supplierIdArg);

  if (!supplierIdArg || isNaN(supplierId) || !appKey || !appSecret) {
    console.error('❌ Uso: node updateSupplierConfig.js <supplierId> <appKey> <appSecret>');
    process.exit(1);
  }

  const newConfig = { appKey, appSecret };

  try {
    await pool.query(
      `UPDATE suppliers
       SET config = $1
       WHERE id = $2`,
      [ JSON.stringify(newConfig), supplierId ]
    );
    console.log(`✔️ Supplier #${supplierId} actualizado con config:`, newConfig);
    process.exit(0);
  } catch (err) {
    console.error('🔥 Error actualizando supplier config:', err);
    process.exit(1);
  }
}

run();
