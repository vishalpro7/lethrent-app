// backend/db.js

const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'LethRent',
  password: 'Sachuma@69', // IMPORTANT: Make sure this is your actual password
  port: 5432,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};