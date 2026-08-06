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
    // 1. Ajouter la colonne sexe à la table eleves
    const checkEleves = await db.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'eleves' AND column_name = 'sexe'
    `);

    if (checkEleves.rows.length === 0) {
      await db.query(`
        ALTER TABLE eleves
        ADD COLUMN sexe VARCHAR(10) DEFAULT 'M' CHECK (sexe IN ('M', 'F'))
      `);
      console.log('✅ Colonne sexe ajoutée à la table eleves (M/F)');
    } else {
      console.log('ℹ️ Colonne sexe déjà existante dans eleves');
    }

    // 2. Ajouter la colonne sexe à la table pre_inscriptions
    const checkPre = await db.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'pre_inscriptions' AND column_name = 'sexe'
    `);

    if (checkPre.rows.length === 0) {
      await db.query(`
        ALTER TABLE pre_inscriptions
        ADD COLUMN sexe VARCHAR(10) DEFAULT 'M' CHECK (sexe IN ('M', 'F'))
      `);
      console.log('✅ Colonne sexe ajoutée à la table pre_inscriptions (M/F)');
    } else {
      console.log('ℹ️ Colonne sexe déjà existante dans pre_inscriptions');
    }

  } catch (err) {
    console.error('❌ Erreur :', err.message);
  } finally {
    await db.end();
  }
}

run();
