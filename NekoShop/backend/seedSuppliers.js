const sqlite3 = require("sqlite3").verbose();
const path    = require("path");

const dbPath = path.join(__dirname, "data", "products.db");
const db     = new sqlite3.Database(dbPath);

const suppliers = [
  {
    name:    "CJdropshipping",
    api_url: "https://api.cjdropshipping.com",
    config:  JSON.stringify({
      type:     "cj",
      apiKey:   "TU_API_KEY_CJ",
      apiSecret:"TU_API_SECRET_CJ"
    })
  },
  {
    name:    "Spocket",
    api_url: "https://api.spocket.co/graphql",
    config:  JSON.stringify({
      type:  "spocket",
      token: "TU_TOKEN_SPOCKET"
    })
  },
  {
    name:    "Syncee",
    api_url: "https://feed.syncee.co",
    config:  JSON.stringify({
      type:    "syncee",
      apiKey:  "TU_API_KEY_SYNCEE",
      feedUrl: "URL_FEED_SYNCEE"
    })
  }
];

db.serialize(() => {
  const stmt = db.prepare(
    "INSERT INTO suppliers (name, api_url, config) VALUES (?, ?, ?)"
  );
  suppliers.forEach(s => {
    stmt.run(s.name, s.api_url, s.config);
  });
  stmt.finalize(() => db.close());
});
