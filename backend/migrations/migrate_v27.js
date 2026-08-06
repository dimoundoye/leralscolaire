require('dotenv').config();
const db = require('../src/config/db');

async function migrate() {
  try {
    console.log('🚀 Migration v27 : Ajout des documents justificatifs pour les demandes d\'inscription...');

    await db.query(`
      ALTER TABLE demandes_inscription_office
      ADD COLUMN IF NOT EXISTS documents_fournis JSONB DEFAULT '{}'::jsonb,
      ADD COLUMN IF NOT EXISTS cni_numero VARCHAR(50),
      ADD COLUMN IF NOT EXISTS autorisation_numero VARCHAR(100),
      ADD COLUMN IF NOT EXISTS matricule_solde VARCHAR(50);
    `);
    console.log('  ✓ Colonnes documents_fournis, cni_numero, autorisation_numero, matricule_solde ajoutées');

    console.log('✅ Migration v27 terminée avec succès !');
  } catch (err) {
    console.error('❌ Erreur migration v27:', err);
  } finally {
    process.exit();
  }
}

migrate();
