const db = require('./db');

async function migrate() {
  try {
    console.log('--- Démarrage de la migration v6 ---');

    // 1. Ajouter etablissement_origine_id à la table notes
    await db.query(`
      ALTER TABLE notes 
      ADD COLUMN IF NOT EXISTS etablissement_origine_id UUID REFERENCES etablissements(id);
    `);
    console.log('✅ Colonne etablissement_origine_id ajoutée à la table notes');

    // 2. Remplir etablissement_origine_id à partir de l'établissement actuel des élèves
    await db.query(`
      UPDATE notes n
      SET etablissement_origine_id = e.etablissement_id
      FROM eleves e
      WHERE n.eleve_id = e.id AND n.etablissement_origine_id IS NULL
    `);
    console.log('✅ etablissement_origine_id rempli pour les notes existantes');

    // 3. Supprimer la contrainte CHECK sur statut si elle existe et la recréer avec TRANSFERE
    await db.query(`
      ALTER TABLE eleves DROP CONSTRAINT IF EXISTS eleves_statut_check;
    `);
    await db.query(`
      ALTER TABLE eleves ADD CONSTRAINT eleves_statut_check CHECK (statut IN ('APTE', 'INAPTE', 'TRANSFERE'));
    `);
    console.log('✅ Contrainte statut mise à jour avec TRANSFERE');

    console.log('--- Migration v6 terminée ---');
  } catch (err) {
    console.error('Erreur migration v6:', err);
  }
  process.exit();
}

migrate();
