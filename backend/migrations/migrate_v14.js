const db = require('./db');

async function migrate() {
  try {
    console.log('--- Démarrage de la migration v14 (Ajout photo_url à pre_inscriptions) ---');

    await db.query(`
      ALTER TABLE pre_inscriptions 
      ADD COLUMN IF NOT EXISTS photo_url TEXT;
    `);

    console.log('✅ Colonne photo_url ajoutée à la table pre_inscriptions.');
    console.log('--- Migration v14 terminée ---');
  } catch (err) {
    console.error('❌ Erreur de migration v14:', err);
  }
  process.exit();
}

migrate();
