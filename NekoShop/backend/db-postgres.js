// File: NekoShop/backend/db-postgres.js

require("dotenv").config();
const { Pool } = require("pg");

// Leemos DATABASE_URL y le indicamos SSL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;
