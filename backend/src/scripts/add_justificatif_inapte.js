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
      WHERE table_name = 'eleves' AND column_name = 'justificatif_inapte_url'
    `);

    if (check.rows.length === 0) {
      await db.query(`
        ALTER TABLE eleves
        ADD COLUMN justificatif_inapte_url TEXT DEFAULT NULL
      `);
      console.log('✅ Colonne justificatif_inapte_url ajoutée à la table eleves.');
    } else {
      console.log('ℹ️ Colonne justificatif_inapte_url déjà existante dans eleves.');
    }
  } catch (err) {
    console.error('❌ Erreur :', err.message);
  } finally {
    await db.end();
  }
}

run();
