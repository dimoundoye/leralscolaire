require('dotenv').config();
const db = require('../src/config/db');

async function migrate() {
  try {
    console.log('🚀 Migration v37 : Ajout des colonnes motif et statut à historique_notes...');

    await db.query(`
      CREATE TABLE IF NOT EXISTS historique_notes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
        ancienne_valeur NUMERIC,
        nouvelle_valeur NUMERIC,
        ancienne_appreciation TEXT,
        nouvelle_appreciation TEXT,
        motif TEXT,
        auteur_id UUID REFERENCES users(id) ON DELETE SET NULL,
        date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        statut VARCHAR(20) DEFAULT 'EN_ATTENTE'
      );
      ALTER TABLE historique_notes ADD COLUMN IF NOT EXISTS motif TEXT;
      ALTER TABLE historique_notes ADD COLUMN IF NOT EXISTS statut VARCHAR(20) DEFAULT 'EN_ATTENTE';
    `);

    console.log('✅ Colonnes motif et statut assurées sur la table historique_notes.');
    console.log('✅ Migration v37 exécutée avec succès !');
  } catch (err) {
    console.error('❌ Erreur migration v37:', err);
  } finally {
    process.exit();
  }
}

migrate();
