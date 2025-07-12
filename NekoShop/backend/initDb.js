// File: backend/initDb.js
const sqlite3 = require("sqlite3").verbose();
const path    = require("path");

const dbPath = path.join(__dirname, "data", "products.db");
const db     = new sqlite3.Database(dbPath, err => {
  if (err) throw err;
  console.log("🔄 Conexión a products.db establecida.");
});

db.serialize(() => {
  // — Migración: añadir columnas images y cover_image_url a products —
  db.all(`PRAGMA table_info(products);`, (err, cols) => {
    if (err) {
      console.error("❌ No existe tabla products:", err);
      return;
    }
    const names = cols.map(c => c.name);
    if (!names.includes("images")) {
      db.run(
        `ALTER TABLE products ADD COLUMN images TEXT NOT NULL DEFAULT '[]';`,
        [], 
        err2 => err2
          ? console.error("❌ Error añadiendo columna images:", err2)
          : console.log("🔧 Columna 'images' añadida a products.")
      );
    }
    if (!names.includes("cover_image_url")) {
      db.run(
        `ALTER TABLE products ADD COLUMN cover_image_url TEXT;`,
        [],
        err3 => err3
          ? console.error("❌ Error añadiendo columna cover_image_url:", err3)
          : console.log("🔧 Columna 'cover_image_url' añadida a products.")
      );
    }
  });

  // — (El resto de tu initDb original para messages, suppliers, email_logs, email_templates) —
  // Tabla messages
  db.all(`PRAGMA table_info(messages);`, (err, cols) => {
    const names    = cols ? cols.map(c => c.name) : [];
    const expected = ["id","type","title","text","direction","created_at","read"];
    const extras   = names.filter(n => !expected.includes(n));
    if (extras.length) {
      db.run("DROP TABLE IF EXISTS messages;", () =>
        console.log("🗑️  Tabla 'messages' eliminada.")
      );
    }
    db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        type         TEXT    NOT NULL DEFAULT 'info',
        title        TEXT    NOT NULL DEFAULT '',
        text         TEXT    NOT NULL DEFAULT '',
        direction    TEXT    NOT NULL DEFAULT 'inbound',
        created_at   INTEGER NOT NULL DEFAULT (strftime('%s','now')),
        read         INTEGER NOT NULL DEFAULT 0
      );
    `, err =>
      err
        ? console.error("❌ Error creando tabla messages:", err)
        : console.log("👌 Tabla 'messages' lista.")
    );
  });

  // Tabla suppliers
  db.run(`
    CREATE TABLE IF NOT EXISTS suppliers (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      api_url     TEXT    NOT NULL,
      config      TEXT    NOT NULL DEFAULT '{}',
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `, err =>
    err
      ? console.error("❌ Error creando tabla suppliers:", err)
      : console.log("👌 Tabla 'suppliers' lista.")
  );
  db.get("SELECT COUNT(*) as cnt FROM suppliers", (e, row) => {
    if (!e && row.cnt === 0) {
      db.run(
        `INSERT INTO suppliers (name, api_url, config) VALUES (?, ?, ?)`,
        ["Proveedor ACME", "https://acme.example.com/api", JSON.stringify({ token: "ABC123" })],
        () => console.log("🪴 Seed de 'suppliers' insertado.")
      );
      db.run(
        `INSERT INTO suppliers (name, api_url, config) VALUES (?, ?, ?)`,
        ["SuperDropship", "https://dropship.example.org/v1", JSON.stringify({ key: "XYZ789" })]
      );
    }
  });

  // Tabla email_logs
  db.run(`
    CREATE TABLE IF NOT EXISTS email_logs (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      kind          TEXT    NOT NULL,
      order_id      INTEGER,
      recipient     TEXT    NOT NULL,
      subject       TEXT    NOT NULL,
      body          TEXT    NOT NULL,
      sent_at       INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    );
  `, err =>
    err
      ? console.error("❌ Error creando tabla email_logs:", err)
      : console.log("👌 Tabla 'email_logs' lista.")
  );

  // Tabla email_templates
  db.run(`
    CREATE TABLE IF NOT EXISTS email_templates (
      key               TEXT PRIMARY KEY,
      subject_template  TEXT NOT NULL,
      body_template     TEXT NOT NULL
    );
  `, err =>
    err
      ? console.error("❌ Error creando tabla email_templates:", err)
      : console.log("👌 Tabla 'email_templates' lista.")
  );

  const templates = [
    {
      key: "order_confirmation",
      subject_template: "✅ Tu pedido #{{order.id}} ha sido recibido",
      body_template: [
        "Hola {{order.customerName}},",
        "",
        "¡Gracias por tu compra! Detalles:",
        "{{#each order.items}}",
        "- {{this.name}} x{{this.qty}} → ${{this.price}}",
        "{{/each}}",
        "",
        "Total: ${{order.total}}",
        "Estado: {{order.status}}",
        "",
        "Saludos,",
        "Tu equipo de NekoDrops Anime"
      ].join("\n")
    },
    {
      key: "supplier_notification",
      subject_template: "📦 Nuevo pedido #{{order.id}} para procesar",
      body_template: [
        "Proveedor,",
        "",
        "Nuevo pedido:",
        "Cliente: {{order.customerName}} <{{order.customerEmail}}> ",
        "",
        "Artículos:",
        "{{#each order.items}}",
        "- {{this.name}} x{{this.qty}}",
        "{{/each}}",
        "",
        "Por favor, procesa cuanto antes.",
        "",
        "Gracias,",
        "Tu equipo de NekoDrops Anime"
      ].join("\n")
    }
  ];

  templates.forEach(tpl => {
    db.get(
      "SELECT COUNT(*) as cnt FROM email_templates WHERE key = ?",
      [tpl.key],
      (e, row) => {
        if (!e && row.cnt === 0) {
          db.run(
            "INSERT INTO email_templates (key, subject_template, body_template) VALUES (?,?,?)",
            [tpl.key, tpl.subject_template, tpl.body_template],
            err2 => {
              if (err2) console.error("❌ Seed email_templates fallo:", err2);
              else console.log(`🎨 Plantilla '${tpl.key}' insertada.`);
            }
          );
        }
      }
    );
  });
});

// Cerrar la DB tras un breve delay
setTimeout(() => {
  db.close(err => {
    if (err) console.error("❌ Error cerrando la DB:", err);
    else     console.log("👌 initDb.js ha terminado.");
  });
}, 500);
