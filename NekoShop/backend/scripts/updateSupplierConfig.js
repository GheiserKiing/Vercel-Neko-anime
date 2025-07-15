#!/usr/bin/env node
require("dotenv").config();
const { Pool } = require("pg");

// Asegúrate de que tu DATABASE_URL incluye ?sslmode=require o configura ssl abajo
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function main() {
  const [ , , id, appKey, appSecret ] = process.argv;
  if (!id || !appKey || !appSecret) {
    console.error("Uso: node updateSupplierConfig.js <supplierId> <appKey> <appSecret>");
    process.exit(1);
  }

  const supplierId = Number(id);
  const config = { appKey, appSecret };

  await pool.query(
    "UPDATE suppliers SET config = $1 WHERE id = $2",
    [config, supplierId]
  );

  console.log(`✔️ Supplier #${supplierId} actualizado con config:`, config);
  await pool.end();
}

main().catch(err => {
  console.error("❌ Error actualizando config del supplier:", err);
  process.exit(1);
});
