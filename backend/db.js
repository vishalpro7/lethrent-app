require('dotenv').config();
const { Pool } = require('pg');

// --- THE TEMPORARY FIX ---
// This is the full connection string URI from Supabase (Transaction Pooler)
// with your password edited into it.
// Example: 'postgresql://postgres:YourActualPassword@db.xyz.supabase.co:6543/postgres'
const connectionString = 'postgresql://postgres.yvocqinvmtydfghzwfyv:Sachuma@69@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres';

// We are adding this log to prove the server is starting with the new code.
console.log('--- SERVER STARTING WITH HARDCODED DATABASE CONNECTION ---');
if (!connectionString.includes('supabase')) {
    console.error('FATAL ERROR: The connectionString variable is not set correctly in db.js!');
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};

    
