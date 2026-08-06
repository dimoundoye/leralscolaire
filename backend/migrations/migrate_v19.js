const db = require('./db');

async function migrate() {
  try {
    console.log('--- Démarrage de la migration v19 (Statut de confirmation des modifications de notes) ---');

    // Add status column to historique_notes table
    await db.query(`
      ALTER TABLE historique_notes 
      ADD COLUMN IF NOT EXISTS statut VARCHAR(20) DEFAULT 'EN_ATTENTE';
    `);
    console.log('✅ Colonne statut ajoutée à la table historique_notes.');

    console.log('--- Migration v19 terminée avec succès ---');
  } catch (err) {
    console.error('❌ Erreur de migration v19:', err);
  }
  process.exit();
}

migrate();
