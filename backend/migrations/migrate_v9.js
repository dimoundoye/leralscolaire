const db = require('./db');

async function migrate() {
  try {
    console.log('--- Démarrage de la migration v9 ---');

    await db.query(`
      CREATE TABLE IF NOT EXISTS regles_passage (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        etablissement_id UUID REFERENCES etablissements(id) ON DELETE CASCADE UNIQUE,
        seuil_passage_direct DECIMAL(4,2) DEFAULT 12.00,
        seuil_passage DECIMAL(4,2) DEFAULT 10.00,
        seuil_cours_vacances DECIMAL(4,2) DEFAULT 8.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Table regles_passage créée');

    console.log('--- Migration v9 terminée ---');
  } catch (err) {
    console.error('Erreur migration v9:', err);
  }
  process.exit();
}

migrate();
