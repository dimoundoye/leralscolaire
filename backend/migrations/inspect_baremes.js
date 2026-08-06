const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const db = require('../src/config/db');
async function check() {
  // List all tables
  const { rows: tables } = await db.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`
  );
  console.log('All tables:', tables.map(r => r.table_name));

  // Check if appreciations/baremes table exists
  const baremeTables = tables.filter(r => 
    r.table_name.includes('barem') || r.table_name.includes('appreci') || r.table_name.includes('notation') || r.table_name.includes('echelle')
  );
  console.log('Barem-related tables:', baremeTables);

  // Check etablissements columns for baremes
  const { rows: etabCols } = await db.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'etablissements' AND column_name LIKE '%barem%'`
  );
  console.log('Etablissements barem columns:', etabCols);
  process.exit();
}
check();
