require("dotenv").config();
const pool = require("../db-postgres");

(async () => {
  try {
    const supplier = {
      id: 9,
      name: "AliExpress",
      config: {
        appKey: "516566",
        appSecret: "jUxo7cxQ3DKXExEX0vIaGuBdoLpxXONE"
      },
      admin_url: "https://neko-shop-frontend.vercel.app/admin"
    };

    await pool.query(`
      INSERT INTO suppliers (id, name, config, admin_url)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        config = EXCLUDED.config,
        admin_url = EXCLUDED.admin_url
    `, [supplier.id, supplier.name, supplier.config, supplier.admin_url]);

    console.log("✅ Supplier AliExpress insertado/actualizado correctamente");
    process.exit();
  } catch (err) {
    console.error("❌ Error al insertar supplier:", err);
    process.exit(1);
  }
})();
