require('dotenv').config();
const db = require('../src/config/db');

async function migrate() {
  try {
    console.log('🚀 Migration v26 : Table des demandes d\'inscription publiques (Établissements & Profs)...');

    await db.query(`
      CREATE TABLE IF NOT EXISTS demandes_inscription_office (
        id SERIAL PRIMARY KEY,
        type_demande VARCHAR(30) NOT NULL, -- 'ETABLISSEMENT' ou 'PROFESSEUR'
        nom VARCHAR(150) NOT NULL,
        prenom VARCHAR(150),
        email VARCHAR(150) NOT NULL,
        telephone VARCHAR(50),
        region VARCHAR(50) NOT NULL DEFAULT 'Dakar',
        ville VARCHAR(100),
        specialite_ou_code VARCHAR(100),
        statut VARCHAR(30) DEFAULT 'EN_ATTENTE', -- 'EN_ATTENTE', 'VALIDÉ', 'REJETÉ'
        motif_rejet TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✓ Table demandes_inscription_office créée');

    console.log('✅ Migration v26 terminée avec succès !');
  } catch (err) {
    console.error('❌ Erreur migration v26:', err);
  } finally {
    process.exit();
  }
}

migrate();
