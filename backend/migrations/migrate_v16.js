const db = require('./db');

async function migrate() {
  try {
    console.log('--- Démarrage de la migration v16 (Module Messagerie) ---');

    // 1. Add droit_envoi_message column to professeurs_etablissements
    await db.query(`
      ALTER TABLE professeurs_etablissements 
      ADD COLUMN IF NOT EXISTS droit_envoi_message BOOLEAN DEFAULT FALSE;
    `);
    console.log('✅ Colonne droit_envoi_message ajoutée à la table professeurs_etablissements.');

    // 2. Add etablissement_id column to messages
    await db.query(`
      ALTER TABLE messages 
      ADD COLUMN IF NOT EXISTS etablissement_id UUID REFERENCES etablissements(id) ON DELETE CASCADE;
    `);
    console.log('✅ Colonne etablissement_id ajoutée à la table messages.');

    // 3. Drop existing constraint messages_destinataire_type_check
    await db.query(`
      ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_destinataire_type_check;
    `);
    
    // 4. Add updated check constraint to allow ADMIN_ETABLISSEMENT
    await db.query(`
      ALTER TABLE messages 
      ADD CONSTRAINT messages_destinataire_type_check 
      CHECK (destinataire_type IN ('CLASSE', 'ELEVE', 'OFFICE_BAC', 'PROFESSEUR', 'ADMIN_ETABLISSEMENT'));
    `);
    console.log('✅ Contrainte messages_destinataire_type_check mise à jour.');

    console.log('--- Migration v16 terminée avec succès ---');
  } catch (err) {
    console.error('❌ Erreur de migration v16:', err);
  }
  process.exit();
}

migrate();
