require('dotenv').config();
const db = require('../src/config/db');

async function migrate() {
  try {
    console.log("🚀 Migration v36 : Synchronisation pre_inscriptions, demandes_attestation et bulletins...");

    // 1. Table pre_inscriptions et colonnes
    await db.query(`
      CREATE TABLE IF NOT EXISTS pre_inscriptions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        classe_id UUID REFERENCES classes(id) ON DELETE CASCADE,
        etablissement_id UUID REFERENCES etablissements(id) ON DELETE CASCADE,
        nom VARCHAR(100) NOT NULL,
        prenom VARCHAR(100) NOT NULL,
        sexe VARCHAR(10) DEFAULT 'M',
        date_naissance DATE,
        lieu_naissance VARCHAR(100),
        nationalite VARCHAR(100),
        telephone VARCHAR(50),
        coordonnees_parent TEXT,
        statut VARCHAR(20) DEFAULT 'APTE',
        statut_validation VARCHAR(20) DEFAULT 'EN_ATTENTE' CHECK (statut_validation IN ('EN_ATTENTE', 'VALIDE', 'REJETE')),
        identifiant_existant VARCHAR(50),
        photo_url TEXT,
        email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE pre_inscriptions ADD COLUMN IF NOT EXISTS sexe VARCHAR(10) DEFAULT 'M';
      ALTER TABLE pre_inscriptions ADD COLUMN IF NOT EXISTS email VARCHAR(255);
      ALTER TABLE pre_inscriptions ADD COLUMN IF NOT EXISTS identifiant_existant VARCHAR(50);
      ALTER TABLE pre_inscriptions ADD COLUMN IF NOT EXISTS photo_url TEXT;
      ALTER TABLE pre_inscriptions ADD COLUMN IF NOT EXISTS statut_validation VARCHAR(20) DEFAULT 'EN_ATTENTE';
    `);
    console.log('  ✓ Table pre_inscriptions et colonnes (sexe, email, etc.) assurées');

    // 2. Colonnes sur eleves
    await db.query(`
      ALTER TABLE eleves ADD COLUMN IF NOT EXISTS sexe VARCHAR(10) DEFAULT 'M';
      ALTER TABLE eleves ADD COLUMN IF NOT EXISTS email VARCHAR(255);
    `);
    console.log('  ✓ Colonnes sexe et email assurées sur eleves');

    // 3. Table demandes_attestation
    await db.query(`
      CREATE TABLE IF NOT EXISTS demandes_attestation (
        id SERIAL PRIMARY KEY,
        eleve_id UUID REFERENCES eleves(id) ON DELETE CASCADE,
        etablissement_id UUID REFERENCES etablissements(id) ON DELETE CASCADE,
        classe_id UUID REFERENCES classes(id) ON DELETE SET NULL,
        statut VARCHAR(20) DEFAULT 'EN_ATTENTE',
        motif_refus TEXT,
        motif_demande TEXT,
        date_demande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        date_traitement TIMESTAMP,
        deja_telecharge BOOLEAN DEFAULT FALSE,
        date_telechargement TIMESTAMP
      );

      ALTER TABLE demandes_attestation ADD COLUMN IF NOT EXISTS classe_id UUID REFERENCES classes(id) ON DELETE SET NULL;
      ALTER TABLE demandes_attestation ADD COLUMN IF NOT EXISTS deja_telecharge BOOLEAN DEFAULT FALSE;
      ALTER TABLE demandes_attestation ADD COLUMN IF NOT EXISTS date_telechargement TIMESTAMP;
    `);
    console.log('  ✓ Table demandes_attestation créée/vérifiée');

    // 4. Tables bulletins autorisés et téléchargements
    await db.query(`
      CREATE TABLE IF NOT EXISTS bulletins_autorises (
        id SERIAL PRIMARY KEY,
        classe_id UUID REFERENCES classes(id) ON DELETE CASCADE,
        semestre INT NOT NULL,
        annee_scolaire VARCHAR(20) NOT NULL,
        autorise BOOLEAN DEFAULT FALSE,
        UNIQUE (classe_id, semestre, annee_scolaire)
      );

      CREATE TABLE IF NOT EXISTS bulletins_telechargements (
        id SERIAL PRIMARY KEY,
        eleve_id UUID REFERENCES eleves(id) ON DELETE CASCADE,
        classe_id UUID REFERENCES classes(id) ON DELETE CASCADE,
        semestre INT NOT NULL,
        annee_scolaire VARCHAR(20) NOT NULL,
        telecharge_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (eleve_id, classe_id, semestre, annee_scolaire)
      );
    `);
    console.log('  ✓ Tables bulletins_autorises et bulletins_telechargements créées/vérifiées');

    // 5. Table messages et colonnes pièces jointes (fichier_url, fichier_nom)
    await db.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        expediteur_id UUID REFERENCES users(id) ON DELETE CASCADE,
        destinataire_type VARCHAR(50),
        destinataire_id UUID,
        sujet VARCHAR(255),
        contenu TEXT NOT NULL,
        date_envoi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        lu BOOLEAN DEFAULT FALSE,
        etablissement_id UUID REFERENCES etablissements(id) ON DELETE CASCADE,
        fichier_url TEXT,
        fichier_nom VARCHAR(255)
      );

      ALTER TABLE messages ADD COLUMN IF NOT EXISTS etablissement_id UUID REFERENCES etablissements(id) ON DELETE CASCADE;
      ALTER TABLE messages ADD COLUMN IF NOT EXISTS fichier_url TEXT;
      ALTER TABLE messages ADD COLUMN IF NOT EXISTS fichier_nom VARCHAR(255);
      ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_destinataire_type_check;
      ALTER TABLE messages ADD CONSTRAINT messages_destinataire_type_check 
        CHECK (destinataire_type IN ('CLASSE', 'ELEVE', 'OFFICE_BAC', 'PROFESSEUR', 'ADMIN_ETABLISSEMENT', 'ALL_PROFESSEURS'));

      ALTER TABLE professeurs_etablissements ADD COLUMN IF NOT EXISTS droit_envoi_message BOOLEAN DEFAULT FALSE;
    `);
    console.log('  ✓ Table messages et colonnes fichier_url / fichier_nom créées/vérifiées');

    console.log('✅ Migration v36 exécutée avec succès !');
  } catch (err) {
    console.error('❌ Erreur migration v36:', err);
  } finally {
    process.exit();
  }
}

migrate();
