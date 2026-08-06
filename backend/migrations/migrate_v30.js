require('dotenv').config();
const db = require('../src/config/db');

async function migrate() {
  try {
    console.log('🚀 Migration v30 : Ajout de la colonne president_prof_id dans jurys_bac pour la désignation par ID Professeur...');

    await db.query(`
      ALTER TABLE jurys_bac
      ADD COLUMN IF NOT EXISTS president_prof_id UUID REFERENCES users(id) ON DELETE SET NULL;
    `);
    console.log('  ✓ Colonne president_prof_id ajoutée à jurys_bac');

    console.log('✅ Migration v30 terminée avec succès !');
  } catch (err) {
    console.error('❌ Erreur migration v30:', err);
  } finally {
    process.exit();
  }
}

migrate();
