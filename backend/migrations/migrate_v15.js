const db = require('./db');

async function migrate() {
  try {
    console.log('--- Démarrage de la migration v15 (Module Enseignant / Professeur) ---');

    // 1. Table professeurs (Profil du Professeur)
    await db.query(`
      CREATE TABLE IF NOT EXISTS professeurs (
        id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        nom VARCHAR(100) NOT NULL,
        prenom VARCHAR(100) NOT NULL,
        telephone VARCHAR(50),
        photo_url TEXT,
        matiere_principale VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Table professeurs créée ou déjà existante.');

    // 2. Altération de professeurs_etablissements pour gérer les invitations
    await db.query(`
      ALTER TABLE professeurs_etablissements 
      ADD COLUMN IF NOT EXISTS statut VARCHAR(20) DEFAULT 'EN_ATTENTE' CHECK (statut IN ('EN_ATTENTE', 'ACCEPTE', 'REFUSE')),
      ADD COLUMN IF NOT EXISTS date_invitation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN IF NOT EXISTS date_reponse TIMESTAMP;
    `);
    console.log('✅ Colonnes statut, date_invitation, date_reponse ajoutées à la table professeurs_etablissements.');

    // 3. Altération de la table absences pour lier au cours, matière, classe, prof et type
    await db.query(`
      ALTER TABLE absences
      ADD COLUMN IF NOT EXISTS type_presence VARCHAR(20) DEFAULT 'ABSENCE' CHECK (type_presence IN ('ABSENCE', 'RETARD')),
      ADD COLUMN IF NOT EXISTS duree_retard INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS matiere_id UUID REFERENCES matieres(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS classe_id UUID REFERENCES classes(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS professeur_id UUID REFERENCES users(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS motif TEXT;
    `);
    console.log('✅ Colonnes type_presence, duree_retard, matiere_id, classe_id, professeur_id, motif ajoutées à la table absences.');

    console.log('--- Migration v15 terminée avec succès ---');
  } catch (err) {
    console.error('❌ Erreur de migration v15:', err);
  }
  process.exit();
}

migrate();
