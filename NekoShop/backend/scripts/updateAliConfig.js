require("dotenv").config();
const pool = require("../db-postgres");

async function main() {
  const supplierId = 9;

  const newConfig = {
    appKey: "516566",
    appSecret: "jUxo7cxQ3DKXExEX0vIaGuBdoLpxXONE"
  };

  try {
    await pool.query(
      "UPDATE suppliers SET config = $1 WHERE id = $2",
      [newConfig, supplierId]
    );
    console.log("✅ Config actualizado correctamente para AliExpress (ID 9)");
  } catch (err) {
    console.error("❌ Error actualizando config:", err);
  } finally {
    process.exit();
  }
}

main();
