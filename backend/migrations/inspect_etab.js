const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const db = require('../src/config/db');
async function check() {
  // Check etablissements columns
  const { rows: cols } = await db.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'etablissements' ORDER BY ordinal_position`
  );
  console.log('Etablissements columns:', cols.map(r => r.column_name));

  // Check if baremes_appreciation table exists
  const { rows: tables } = await db.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`
  );
  console.log('Tables bareme-like:', tables.map(r => r.table_name).filter(t => ['barem','appreci','notation','echelle','grille'].some(k => t.includes(k))));

  process.exit();
}
check();
