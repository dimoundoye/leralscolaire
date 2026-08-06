const db = require('./db');

async function migrate() {
  try {
    console.log('--- Démarrage de la migration v8 ---');

    // 1. Ajouter classe_id et colonnes décision à bulletins
    await db.query(`
      ALTER TABLE bulletins 
      ADD COLUMN IF NOT EXISTS classe_id UUID REFERENCES classes(id) ON DELETE CASCADE,
      ADD COLUMN IF NOT EXISTS decision_detail TEXT,
      ADD COLUMN IF NOT EXISTS decision_auto BOOLEAN DEFAULT TRUE
    `);
    console.log('✅ Colonnes ajoutées à la table bulletins');

    // 2. Ajouter contrainte unique pour l'upsert
    await db.query(`
      ALTER TABLE bulletins DROP CONSTRAINT IF EXISTS bulletins_eleve_classe_annee;
    `);
    await db.query(`
      ALTER TABLE bulletins ADD CONSTRAINT bulletins_eleve_classe_annee UNIQUE (eleve_id, classe_id, annee_scolaire);
    `);
    console.log('✅ Contrainte unique ajoutée sur (eleve_id, classe_id, annee_scolaire)');

    console.log('--- Migration v8 terminée ---');
  } catch (err) {
    console.error('Erreur migration v8:', err);
  }
  process.exit();
}

migrate();
