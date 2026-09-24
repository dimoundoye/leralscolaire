require('dotenv').config();
const db = require('../src/config/db');

// Migration v42 : géolocalisation de l'émargement
// - position GPS et rayon autorisé de l'établissement (cours en salle)
// - terrains d'EPS déclarés par l'établissement (peuvent être éloignés de l'établissement)
async function migrate() {
  try {
    console.log('🚀 Migration v42 : position GPS des établissements et terrains d\'EPS...');
    await db.query(`
      ALTER TABLE etablissements
        ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS rayon_emargement_metres INT NOT NULL DEFAULT 200;

      CREATE TABLE IF NOT EXISTS terrains_eps (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        etablissement_id UUID NOT NULL REFERENCES etablissements(id) ON DELETE CASCADE,
        nom VARCHAR(150) NOT NULL,
        latitude DOUBLE PRECISION NOT NULL,
        longitude DOUBLE PRECISION NOT NULL,
        rayon_metres INT NOT NULL DEFAULT 300,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_terrains_eps_etablissement ON terrains_eps(etablissement_id);

      ALTER TABLE emargements ADD COLUMN IF NOT EXISTS terrain_eps_id UUID REFERENCES terrains_eps(id) ON DELETE SET NULL;
    `);
    console.log('✅ Migration v42 exécutée avec succès !');
  } catch (err) {
    console.error('❌ Erreur migration v42:', err);
  } finally {
    process.exit();
  }
}

migrate();
