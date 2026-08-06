require('dotenv').config();
const db = require('../src/config/db');

async function migrate() {
  try {
    console.log('🚀 Démarrage de la migration v21 : Cahier de Texte Numérique...');

    await db.query(`
      CREATE TABLE IF NOT EXISTS cahier_de_texte (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        etablissement_id UUID REFERENCES etablissements(id) ON DELETE CASCADE,
        classe_id UUID REFERENCES classes(id) ON DELETE CASCADE,
        matiere_id UUID REFERENCES matieres(id) ON DELETE CASCADE,
        professeur_id UUID REFERENCES users(id) ON DELETE CASCADE,
        date_seance DATE NOT NULL DEFAULT CURRENT_DATE,
        heure_debut VARCHAR(10),
        heure_fin VARCHAR(10),
        titre_lecon VARCHAR(255) NOT NULL,
        contenu_seance TEXT NOT NULL,
        travail_a_faire TEXT,
        date_remise_devoir DATE,
        fichier_url TEXT,
        fichier_nom TEXT,
        visa_admin BOOLEAN DEFAULT FALSE,
        date_visa TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Table cahier_de_texte créée ou mise à jour avec succès.');
  } catch (err) {
    console.error('❌ Erreur migration v21:', err);
  } finally {
    process.exit();
  }
}

migrate();
