const sqlite3 = require("sqlite3").verbose();
const path    = require("path");

const cjService      = require("./providers/cjdropshippingService");
const spocketService = require("./providers/spocketService");
const synceeService  = require("./providers/synceeService");

const dbFile = path.join(__dirname, "..", "data", "products.db");

async function syncSupplier(supplierId) {
  const supplier = await new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbFile);
    db.get(
      "SELECT * FROM suppliers WHERE id = ?",
      [supplierId],
      (err, row) => {
        db.close();
        if (err) return reject(err);
        if (!row) return reject(new Error("Proveedor no encontrado"));
        try {
          row.config = JSON.parse(row.config);
        } catch {
          row.config = {};
        }
        resolve(row);
      }
    );
  });

  let externalProducts = [];
  const type = supplier.config.type;
  if (type === "cj") {
    externalProducts = await cjService.fetchProducts(supplier.config);
  } else if (type === "spocket") {
    externalProducts = await spocketService.fetchProducts(supplier.config);
  } else if (type === "syncee") {
    externalProducts = await synceeService.fetchProducts(supplier.config);
  } else {
    throw new Error(
      `Tipo de proveedor desconocido "${type}". Debe ser "cj", "spocket" o "syncee".`
    );
  }

  const count = await new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbFile);
    db.serialize(() => {
      db.run(
        "DELETE FROM products WHERE supplier_id = ?",
        [supplierId],
        err => {
          if (err) return reject(err);
          const stmt = db.prepare(
            `INSERT INTO products 
              (title, description, price, stock, image_url, supplier_id, provider_product_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`
          );
          externalProducts.forEach(p => {
            stmt.run(
              p.title,
              p.description,
              p.price,
              p.stock,
              p.imageUrl,
              supplierId,
              p.id
            );
          });
          stmt.finalize(err => {
            if (err) return reject(err);
            db.get(
              "SELECT COUNT(*) AS cnt FROM products WHERE supplier_id = ?",
              [supplierId],
              (err, row) => {
                db.close();
                if (err) return reject(err);
                resolve(row.cnt);
              }
            );
          });
        }
      );
    });
  });

  return count;
}

module.exports = { syncSupplier };
