require('dotenv').config();
const db = require('../src/config/db');

async function migrate() {
  try {
    console.log('🚀 Migration v28 : Création de la table livrets_scolaires_bac pour le partage des livrets du BAC par les établissements...');

    await db.query(`
      CREATE TABLE IF NOT EXISTS livrets_scolaires_bac (
        id SERIAL PRIMARY KEY,
        eleve_id UUID REFERENCES eleves(id) ON DELETE CASCADE,
        etablissement_id UUID REFERENCES etablissements(id) ON DELETE SET NULL,
        annee INT NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
        serie VARCHAR(20) NOT NULL,
        moyenne_seconde NUMERIC(4,2),
        moyenne_premiere NUMERIC(4,2),
        moyenne_terminale NUMERIC(4,2),
        appreciation_conseil TEXT,
        fichier_livret_url VARCHAR(255),
        statut_validation VARCHAR(30) DEFAULT 'RÉCEPTIONNÉ', -- 'RÉCEPTIONNÉ', 'CONFORME', 'REJETÉ'
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✓ Table livrets_scolaires_bac créée');

    console.log('✅ Migration v28 terminée avec succès !');
  } catch (err) {
    console.error('❌ Erreur migration v28:', err);
  } finally {
    process.exit();
  }
}

migrate();
