const db = require('./db');

async function migrate() {
  try {
    console.log('--- Démarrage de la migration v5 ---');

    // 1. Ajouter les colonnes manquantes à la table eleves
    await db.query(`
      ALTER TABLE eleves 
      ADD COLUMN IF NOT EXISTS lieu_naissance VARCHAR(100),
      ADD COLUMN IF NOT EXISTS nationalite VARCHAR(100),
      ADD COLUMN IF NOT EXISTS telephone VARCHAR(20),
      ADD COLUMN IF NOT EXISTS coordonnees_parent TEXT;
    `);
    console.log('✅ Colonnes d\'identité ajoutées à la table eleves');

    // 2. Ajouter une colonne pour le mot de passe provisoire dans users (pour l'export initial)
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS password_provisoire VARCHAR(100);
    `);
    console.log('✅ Colonne password_provisoire ajoutée à la table users');

    // 3. Table pour les transferts (historique et suivi)
    await db.query(`
      CREATE TABLE IF NOT EXISTS transferts_eleves (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        eleve_id UUID REFERENCES eleves(id) ON DELETE CASCADE,
        ancien_etablissement_id UUID REFERENCES etablissements(id),
        nouveau_etablissement_id UUID REFERENCES etablissements(id),
        motif TEXT,
        date_transfert TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        statut_transfert VARCHAR(20) DEFAULT 'EN_ATTENTE' CHECK (statut_transfert IN ('EN_ATTENTE', 'VALIDE', 'REJETE'))
      );
    `);
    console.log('✅ Table transferts_eleves créée');

    console.log('--- Migration v5 terminée avec succès ---');
  } catch (err) {
    console.error('❌ Erreur de migration v5:', err);
  } finally {
    process.exit();
  }
}

migrate();
