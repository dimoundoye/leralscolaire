const db = require('./db');

async function migrate() {
  try {
    console.log('--- Démarrage de la migration ---');
    
    // 1. Ajouter la colonne semestre si elle n'existe pas
    await db.query(`
      ALTER TABLE notes ADD COLUMN IF NOT EXISTS semestre INTEGER DEFAULT 1;
    `);
    console.log('✅ Colonne semestre ajoutée (ou déjà présente)');

    // 2. Ajouter la contrainte d'unicité pour les notes (un élève a une seule note par matière par semestre/trimestre)
    // On va d'abord supprimer les doublons potentiels pour éviter les erreurs lors de l'ajout de la contrainte
    await db.query(`
      DELETE FROM notes a USING notes b 
      WHERE a.id < b.id 
      AND a.eleve_id = b.eleve_id 
      AND a.matiere_id = b.matiere_id 
      AND COALESCE(a.semestre, 0) = COALESCE(b.semestre, 0)
      AND COALESCE(a.trimestre, 0) = COALESCE(b.trimestre, 0);
    `);
    
    await db.query(`
      ALTER TABLE notes DROP CONSTRAINT IF EXISTS unique_note_per_period;
      ALTER TABLE notes ADD CONSTRAINT unique_note_per_period UNIQUE (eleve_id, matiere_id, semestre, trimestre);
    `);
    console.log('✅ Contrainte d\'unicité ajoutée');

    // 3. Ajouter une table pour les Professeurs (ou utiliser le rôle PROFESSEUR dans users et lier à l'établissement)
    // On a déjà la table users avec le rôle PROFESSEUR.
    // Il nous faut une table de liaison pour savoir quel professeur travaille dans quel établissement.
    await db.query(`
      CREATE TABLE IF NOT EXISTS professeurs_etablissements (
        professeur_id UUID REFERENCES users(id) ON DELETE CASCADE,
        etablissement_id UUID REFERENCES etablissements(id) ON DELETE CASCADE,
        PRIMARY KEY (professeur_id, etablissement_id)
      );
    `);
    console.log('✅ Table professeurs_etablissements créée');

    // 4. Ajouter une table pour les matières enseignées par les professeurs
    await db.query(`
      CREATE TABLE IF NOT EXISTS professeur_matieres (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        professeur_id UUID REFERENCES users(id) ON DELETE CASCADE,
        matiere_id UUID REFERENCES matieres(id) ON DELETE CASCADE,
        classe_id UUID REFERENCES classes(id) ON DELETE CASCADE,
        UNIQUE (professeur_id, matiere_id, classe_id)
      );
    `);
    console.log('✅ Table professeur_matieres créée');

    console.log('--- Migration terminée avec succès ---');
  } catch (err) {
    console.error('❌ Erreur de migration:', err);
  } finally {
    process.exit();
  }
}

migrate();
