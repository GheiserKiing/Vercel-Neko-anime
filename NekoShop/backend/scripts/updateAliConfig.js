const pool = require("../db-postgres");

(async () => {
  try {
    const supplierId = 9;

    const { rows } = await pool.query(
      "SELECT * FROM suppliers WHERE id=$1",
      [supplierId]
    );

    if (rows.length === 0) {
      console.log("⚠️ No existe el supplier con ID 9. Creándolo...");

      await pool.query(
        `INSERT INTO suppliers (id, name, config, admin_url)
         VALUES ($1, $2, $3, $4)`,
        [
          supplierId,
          "AliExpress",
          {
            appKey: '516566',
            appSecret: 'jUxo7cxQ3DKXExEX0vIaGuBdoLpxXONE',
          },
          "https://neko-shop-frontend.vercel.app/admin"
        ]
      );

      console.log("✅ Supplier AliExpress creado con ID 9");
    } else {
      console.log("🔄 Ya existe, actualizando config...");

      await pool.query(
        "UPDATE suppliers SET config = $1 WHERE id = $2",
        [
          {
            appKey: '516566',
            appSecret: 'jUxo7cxQ3DKXExEX0vIaGuBdoLpxXONE',
          },
          supplierId
        ]
      );

      console.log("✅ Config actualizado correctamente para AliExpress (ID 9)");
    }

    process.exit();
  } catch (err) {
    console.error("❌ Error al actualizar supplier:", err);
    process.exit(1);
  }
})();
