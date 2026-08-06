require('dotenv').config();
const db = require('../src/config/db');

async function migrate() {
  try {
    console.log('🚀 Migration v31 : Création du schéma de saisie des notes et délibération du Jury BAC...');

    // 1. Table notes_candidats_bac (Saisie des notes par épreuve)
    await db.query(`
      CREATE TABLE IF NOT EXISTS notes_candidats_bac (
        id SERIAL PRIMARY KEY,
        candidat_id UUID REFERENCES resultats_examens_nationaux(id) ON DELETE CASCADE,
        matiere_code VARCHAR(50) NOT NULL, -- ex: 'MATHS', 'PC', 'SVT', 'FRANCAIS', 'PHILO', 'ANGLAIS'
        matiere_nom VARCHAR(100) NOT NULL,
        note NUMERIC(4,2), -- note /20
        coefficient INT NOT NULL DEFAULT 1,
        statut_presence VARCHAR(20) DEFAULT 'PRESENT', -- 'PRESENT', 'ABI', 'ABJ'
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_candidat_matiere UNIQUE(candidat_id, matiere_code)
      );
    `);
    console.log('  ✓ Table notes_candidats_bac créée');

    // 2. Extension de resultats_examens_nationaux pour la délibération et le verrouillage
    await db.query(`
      ALTER TABLE resultats_examens_nationaux
      ADD COLUMN IF NOT EXISTS statut_deliberation VARCHAR(30) DEFAULT 'EN_ATTENTE', -- 'ADMIS', 'SECOND_TOUR', 'AJOURNÉ', 'EN_ATTENTE'
      ADD COLUMN IF NOT EXISTS mention VARCHAR(30), -- 'PASSABLE', 'ASSEZ_BIEN', 'BIEN', 'TRÈS_BIEN'
      ADD COLUMN IF NOT EXISTS verrouille BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS repeche BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS pv_signe_at TIMESTAMP WITH TIME ZONE;
    `);
    console.log('  ✓ Colonnes de délibération ajoutées à resultats_examens_nationaux');

    console.log('✅ Migration v31 terminée avec succès !');
  } catch (err) {
    console.error('❌ Erreur migration v31:', err);
  } finally {
    process.exit();
  }
}

migrate();
