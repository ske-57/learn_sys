const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'learn_user',
  password: process.env.DB_PASSWORD || 'learn_user_57',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'learn_db',
});

module.exports = pool;