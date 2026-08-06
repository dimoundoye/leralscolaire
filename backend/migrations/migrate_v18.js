const db = require('./db');

async function migrate() {
  try {
    console.log('--- Démarrage de la migration v18 (Appréciations globales du conseil) ---');

    // Add appreciations_conseil column to bulletins table
    await db.query(`
      ALTER TABLE bulletins 
      ADD COLUMN IF NOT EXISTS appreciations_conseil TEXT;
    `);
    console.log('✅ Colonne appreciations_conseil ajoutée à la table bulletins.');

    console.log('--- Migration v18 terminée avec succès ---');
  } catch (err) {
    console.error('❌ Erreur de migration v18:', err);
  }
  process.exit();
}

migrate();
