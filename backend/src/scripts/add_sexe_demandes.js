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
    const check = await db.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'demandes_inscription_office' AND column_name = 'sexe'
    `);

    if (check.rows.length === 0) {
      await db.query(`
        ALTER TABLE demandes_inscription_office
        ADD COLUMN sexe VARCHAR(10) DEFAULT 'M'
      `);
      console.log('✅ Colonne sexe ajoutée à la table demandes_inscription_office');
    } else {
      console.log('ℹ️ Colonne sexe déjà présente dans demandes_inscription_office');
    }
  } catch (err) {
    console.error('❌ Erreur :', err.message);
  } finally {
    await db.end();
  }
}

run();
