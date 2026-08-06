require('dotenv').config();
const db = require('../src/config/db');

async function migrate() {
  try {
    console.log('🚀 Migration v24 : Perfectionnement 3.3.1 (Dossiers, Suspension & N° Table)...');

    // 1. Statut dossier (EN_ATTENTE, VALIDÉ, REJETÉ)
    await db.query(`
      ALTER TABLE resultats_examens_nationaux
      ADD COLUMN IF NOT EXISTS statut_dossier VARCHAR(30) DEFAULT 'VALIDÉ';
    `);
    console.log('  ✓ Column statut_dossier ajoutée');

    // 2. Motif de suspension
    await db.query(`
      ALTER TABLE resultats_examens_nationaux
      ADD COLUMN IF NOT EXISTS motif_suspension TEXT;
    `);
    console.log('  ✓ Column motif_suspension ajoutée');

    // 3. Mettre à jour la contrainte CHECK sur statut_candidat pour inclure 'SUSPENDU'
    await db.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'resultats_examens_nationaux_statut_candidat_check'
        ) THEN
          ALTER TABLE resultats_examens_nationaux DROP CONSTRAINT resultats_examens_nationaux_statut_candidat_check;
        END IF;
        ALTER TABLE resultats_examens_nationaux ADD CONSTRAINT resultats_examens_nationaux_statut_candidat_check
          CHECK (statut_candidat IN ('CONVOQUÉ', 'ADMIS', 'AJOURNÉ', 'EXCLU', 'SUSPENDU'));
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Contrainte statut_candidat non modifiée : %', SQLERRM;
      END
      $$;
    `);
    console.log('  ✓ Contrainte statut_candidat (avec SUSPENDU) mise à jour');

    console.log('✅ Migration v24 terminée avec succès !');
  } catch (err) {
    console.error('❌ Erreur migration v24:', err);
  } finally {
    process.exit();
  }
}

migrate();
