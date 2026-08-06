require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const db = require('../config/db');

async function run() {
  try {
    const res = await db.query('SELECT * FROM etablissements LIMIT 1');
    console.log('Etablissements columns:', Object.keys(res.rows[0] || {}));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
