const db = require('./db');

async function migrate() {
  try {
    console.log('--- Démarrage de la migration v7 ---');

    await db.query(`
      CREATE TABLE IF NOT EXISTS documents_partages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        expediteur_etablissement_id UUID REFERENCES etablissements(id) ON DELETE CASCADE,
        destinataire_etablissement_id UUID REFERENCES etablissements(id) ON DELETE CASCADE,
        eleve_id UUID REFERENCES eleves(id) ON DELETE SET NULL,
        nom_fichier VARCHAR(255) NOT NULL,
        chemin_fichier TEXT NOT NULL,
        taille BIGINT,
        type_fichier VARCHAR(100),
        description TEXT,
        date_envoi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        lu BOOLEAN DEFAULT FALSE
      );
    `);
    console.log('✅ Table documents_partages créée');

    // Créer le dossier de stockage
    const dir = 'uploads/partages';
    if (!require('fs').existsSync(dir)) {
      require('fs').mkdirSync(dir, { recursive: true });
      console.log('✅ Dossier uploads/partages créé');
    }

    console.log('--- Migration v7 terminée ---');
  } catch (err) {
    console.error('Erreur migration v7:', err);
  }
  process.exit();
}

migrate();
