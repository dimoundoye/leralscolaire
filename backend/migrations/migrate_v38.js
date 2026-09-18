require('dotenv').config();
const db = require('../src/config/db');

async function migrate() {
  try {
    console.log("🚀 Migration v38 : Remplacement de unique_note_per_period par unique_note_per_type sur notes...");

    // 1. Supprimer l'ancienne contrainte qui empêchait d'avoir à la fois un devoir et une composition
    await db.query(`
      ALTER TABLE notes DROP CONSTRAINT IF EXISTS unique_note_per_period;
    `);
    console.log("  ✓ Ancienne contrainte unique_note_per_period supprimée.");

    // 2. Ajouter la nouvelle contrainte incluant le type de note (DEVOIR, COMPOSITION, EXAMEN)
    await db.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'unique_note_per_type'
        ) THEN
          ALTER TABLE notes ADD CONSTRAINT unique_note_per_type UNIQUE (eleve_id, matiere_id, semestre, type_note, trimestre);
        END IF;
      END $$;
    `);
    console.log("  ✓ Nouvelle contrainte unique_note_per_type assurée.");

    console.log('✅ Migration v38 exécutée avec succès !');
  } catch (err) {
    console.error('❌ Erreur migration v38:', err);
  } finally {
    process.exit();
  }
}

migrate();
