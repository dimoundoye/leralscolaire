const db = require('./db');

async function migrate() {
  try {
    console.log('--- Démarrage de la migration v13 (Ajout identifiant_existant à pre_inscriptions) ---');

    await db.query(`
      ALTER TABLE pre_inscriptions 
      ADD COLUMN IF NOT EXISTS identifiant_existant VARCHAR(50);
    `);

    console.log('✅ Colonne identifiant_existant ajoutée à la table pre_inscriptions.');
    console.log('--- Migration v13 terminée ---');
  } catch (err) {
    console.error('❌ Erreur de migration v13:', err);
  }
  process.exit();
}

migrate();
