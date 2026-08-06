require('dotenv').config();
const db = require('../src/config/db');

async function migrate() {
  try {
    console.log('🚀 Démarrage de la migration v22 : Portail Résultats BAC/BFEM...');

    // Créer la table si elle n'existe pas (sécurité)
    await db.query(`
      CREATE TABLE IF NOT EXISTS resultats_examens_nationaux (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        eleve_id UUID REFERENCES eleves(id) ON DELETE CASCADE,
        type_examen VARCHAR(50) NOT NULL,
        annee INTEGER NOT NULL,
        moyenne NUMERIC(5,2),
        mention VARCHAR(100),
        statut_resultat VARCHAR(50),
        details JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ajout des colonnes BAC Office — avec IF NOT EXISTS pour éviter les erreurs
    const colonnes = [
      `ALTER TABLE resultats_examens_nationaux ADD COLUMN IF NOT EXISTS numero_table VARCHAR(50)`,
      `ALTER TABLE resultats_examens_nationaux ADD COLUMN IF NOT EXISTS serie VARCHAR(30)`,
      `ALTER TABLE resultats_examens_nationaux ADD COLUMN IF NOT EXISTS jury VARCHAR(100)`,
      `ALTER TABLE resultats_examens_nationaux ADD COLUMN IF NOT EXISTS centre_examen VARCHAR(200)`,
      `ALTER TABLE resultats_examens_nationaux ADD COLUMN IF NOT EXISTS statut_candidat VARCHAR(30) DEFAULT 'CONVOQUÉ'`,
      `ALTER TABLE resultats_examens_nationaux ADD COLUMN IF NOT EXISTS appreciation_jury TEXT`,
      `ALTER TABLE resultats_examens_nationaux ADD COLUMN IF NOT EXISTS details_epreuves JSONB`,
      `ALTER TABLE resultats_examens_nationaux ADD COLUMN IF NOT EXISTS date_deliberation DATE`,
      `ALTER TABLE resultats_examens_nationaux ADD COLUMN IF NOT EXISTS publie BOOLEAN DEFAULT FALSE`,
      `ALTER TABLE resultats_examens_nationaux ADD COLUMN IF NOT EXISTS region VARCHAR(100)`,
      `ALTER TABLE resultats_examens_nationaux ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`,
    ];

    for (const sql of colonnes) {
      await db.query(sql);
      console.log(`  ✓ ${sql.replace('ALTER TABLE resultats_examens_nationaux ', '')}`);
    }

    // Contrainte CHECK sur statut_candidat
    await db.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'chk_statut_candidat'
        ) THEN
          ALTER TABLE resultats_examens_nationaux 
          ADD CONSTRAINT chk_statut_candidat 
          CHECK (statut_candidat IN ('ADMIS', 'AJOURNÉ', 'EXCLU', 'CONVOQUÉ'));
        END IF;
      END
      $$;
    `);
    console.log('  ✓ Contrainte CHECK statut_candidat ajoutée');

    // Index pour la recherche par numero_table
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_resultats_numero_table 
      ON resultats_examens_nationaux(numero_table);
    `);
    console.log('  ✓ Index sur numero_table créé');

    // Index pour filtrer par publie
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_resultats_publie 
      ON resultats_examens_nationaux(publie, eleve_id);
    `);
    console.log('  ✓ Index sur publie créé');

    console.log('\n✅ Migration v22 terminée avec succès !');
    console.log('   Table resultats_examens_nationaux enrichie pour le module Office du BAC.');
  } catch (err) {
    console.error('❌ Erreur migration v22:', err);
  } finally {
    process.exit();
  }
}

migrate();
