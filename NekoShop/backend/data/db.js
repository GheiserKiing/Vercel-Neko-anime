// backend/data/db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'products.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("Error al conectar DB:", err);
});

module.exports = {
  all: (sql, params = []) =>
    new Promise((resolve, reject) =>
      db.all(sql, params, (err, rows) =>
        err ? reject(err) : resolve(rows)
      )
    ),

  run: (sql, params = []) =>
    new Promise((resolve, reject) =>
      db.run(sql, params, function (err) {
        err ? reject(err) : resolve({ lastID: this.lastID, changes: this.changes });
      })
    ),
};
