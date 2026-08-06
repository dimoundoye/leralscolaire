const db = require('./db');

async function migrate() {
  try {
    console.log('--- Démarrage de la migration v12 (Pré-inscriptions) ---');

    await db.query(`
      CREATE TABLE IF NOT EXISTS pre_inscriptions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        classe_id UUID REFERENCES classes(id) ON DELETE CASCADE,
        etablissement_id UUID REFERENCES etablissements(id) ON DELETE CASCADE,
        nom VARCHAR(100) NOT NULL,
        prenom VARCHAR(100) NOT NULL,
        date_naissance DATE,
        lieu_naissance VARCHAR(100),
        nationalite VARCHAR(100),
        telephone VARCHAR(50),
        coordonnees_parent TEXT,
        statut VARCHAR(20) DEFAULT 'APTE',
        statut_validation VARCHAR(20) DEFAULT 'EN_ATTENTE' CHECK (statut_validation IN ('EN_ATTENTE', 'VALIDE', 'REJETE')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Table pre_inscriptions créée ou déjà existante.');
    console.log('--- Migration v12 terminée ---');
  } catch (err) {
    console.error('❌ Erreur de migration v12:', err);
  }
  process.exit();
}

migrate();
