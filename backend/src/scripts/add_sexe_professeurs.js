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
    // Vérifier si la colonne existe déjà
    const check = await db.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'professeurs' AND column_name = 'sexe'
    `);

    if (check.rows.length === 0) {
      await db.query(`
        ALTER TABLE professeurs
        ADD COLUMN sexe VARCHAR(10) DEFAULT 'M' CHECK (sexe IN ('M', 'F'))
      `);
      console.log('✅ Colonne sexe ajoutée à la table professeurs (M/F)');
    } else {
      console.log('ℹ️ Colonne sexe déjà existante dans professeurs');
    }

    // Afficher les colonnes actuelles
    const cols = await db.query(`
      SELECT column_name, data_type FROM information_schema.columns
      WHERE table_name = 'professeurs' ORDER BY ordinal_position
    `);
    console.log('Colonnes actuelles :', cols.rows.map(r => r.column_name).join(', '));
  } catch (err) {
    console.error('❌ Erreur :', err.message);
  } finally {
    await db.end();
  }
}

run();
