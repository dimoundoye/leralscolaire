require('dotenv').config();
const db = require('../src/config/db');

async function migrate() {
  try {
    console.log('🚀 Migration v32 : Création de la table signalements_discipline pour le suivi de la Vie Scolaire...');

    // 1. Table signalements_discipline
    await db.query(`
      CREATE TABLE IF NOT EXISTS signalements_discipline (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        etablissement_id UUID REFERENCES etablissements(id) ON DELETE CASCADE,
        eleve_id UUID REFERENCES eleves(id) ON DELETE CASCADE,
        auteur_id UUID REFERENCES users(id) ON DELETE SET NULL,
        auteur_type VARCHAR(30) NOT NULL DEFAULT 'PROFESSEUR', -- 'PROFESSEUR' ou 'ETABLISSEMENT'
        type_action VARCHAR(30) NOT NULL, -- 'SIGNALEMENT', 'CONVOCATION', 'REMARQUE'
        gravite VARCHAR(20) DEFAULT 'INFO', -- 'ENCOURAGEMENT', 'INFO', 'AVERTISSEMENT', 'GRAVE'
        matiere_code VARCHAR(50),
        matiere_nom VARCHAR(100),
        motif VARCHAR(255) NOT NULL,
        description TEXT,
        date_rendez_vous TIMESTAMP WITH TIME ZONE,
        lieu_rendez_vous VARCHAR(150),
        statut VARCHAR(30) DEFAULT 'TRANSMIS', -- 'TRANSMIS', 'VU_PAR_PARENT', 'HONORE', 'RESOLU', 'ANNULE'
        compte_rendu_rdv TEXT,
        notifie_email BOOLEAN DEFAULT FALSE,
        notifie_sms BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✓ Table signalements_discipline créée avec succès');

    // Index pour des recherches rapides
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_sig_etablissement ON signalements_discipline(etablissement_id);
      CREATE INDEX IF NOT EXISTS idx_sig_eleve ON signalements_discipline(eleve_id);
      CREATE INDEX IF NOT EXISTS idx_sig_auteur ON signalements_discipline(auteur_id);
      CREATE INDEX IF NOT EXISTS idx_sig_type ON signalements_discipline(type_action);
    `);
    console.log('  ✓ Index de performance ajoutés');

    console.log('✅ Migration v32 terminée avec succès !');
  } catch (err) {
    console.error('❌ Erreur lors de la migration v32:', err);
  } finally {
    process.exit();
  }
}

migrate();
