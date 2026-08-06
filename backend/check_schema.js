const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

async function main() {
  try {
    const r = await pool.query(
      `SELECT column_name, data_type FROM information_schema.columns 
       WHERE table_name = 'professeurs_etablissements' ORDER BY ordinal_position`
    );
    console.log('Columns in professeurs_etablissements:');
    console.log(JSON.stringify(r.rows, null, 2));

    // Also check messages table
    const r2 = await pool.query(
      `SELECT column_name, data_type FROM information_schema.columns 
       WHERE table_name = 'messages' ORDER BY ordinal_position`
    );
    console.log('\nColumns in messages:');
    console.log(JSON.stringify(r2.rows, null, 2));
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await pool.end();
  }
}
main();
