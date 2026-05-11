const db = require('./db');

async function migrate() {
  try {
    console.log('--- Démarrage de la migration v4 ---');

    // 1. Table messages
    await db.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        expediteur_id UUID REFERENCES users(id) ON DELETE CASCADE,
        destinataire_type VARCHAR(20) CHECK (destinataire_type IN ('CLASSE', 'ELEVE', 'OFFICE_BAC')),
        destinataire_id UUID, -- Peut être ID classe, ID eleve, ou NULL pour Office
        sujet VARCHAR(255),
        contenu TEXT NOT NULL,
        date_envoi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        lu BOOLEAN DEFAULT FALSE
      );
    `);
    console.log('✅ Table messages créée');

    console.log('--- Migration v4 terminée avec succès ---');
  } catch (err) {
    console.error('❌ Erreur de migration v4:', err);
  } finally {
    process.exit();
  }
}

migrate();
