const db = require('./db');

async function migrate() {
  try {
    console.log('--- Démarrage de la migration v17 (Décision et observations du jury) ---');

    // Add observations_jury column to bulletins table
    await db.query(`
      ALTER TABLE bulletins 
      ADD COLUMN IF NOT EXISTS observations_jury TEXT;
    `);
    console.log('✅ Colonne observations_jury ajoutée à la table bulletins.');

    console.log('--- Migration v17 terminée avec succès ---');
  } catch (err) {
    console.error('❌ Erreur de migration v17:', err);
  }
  process.exit();
}

migrate();
