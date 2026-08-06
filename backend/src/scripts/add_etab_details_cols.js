const { Pool } = require('pg');
require('dotenv').config();

const db = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: (process.env.DB_PASS || '').replace(/^"|"$/g, ''),
  database: process.env.DB_NAME || 'leralscolaire',
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function run() {
  try {
    const cols = ['telephone', 'autorisation_numero'];
    for (const col of cols) {
      const check = await db.query(`
        SELECT column_name FROM information_schema.columns
        WHERE table_name = 'etablissements' AND column_name = $1
      `, [col]);
      if (check.rows.length === 0) {
        await db.query(`ALTER TABLE etablissements ADD COLUMN ${col} VARCHAR(255)`);
        console.log(`✅ Colonne ${col} ajoutée à etablissements`);
      } else {
        console.log(`ℹ️ Colonne ${col} déjà présente dans etablissements`);
      }
    }
  } catch (err) {
    console.error('❌ Erreur :', err.message);
  } finally {
    await db.end();
  }
}

run();
