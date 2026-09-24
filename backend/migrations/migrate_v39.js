require('dotenv').config();
const db = require('../src/config/db');

// Migration v39 : schéma auparavant appliqué à chaque démarrage du serveur (src/server.js).
// Toutes les instructions sont idempotentes (IF NOT EXISTS / DROP ... IF EXISTS).
async function migrate() {
  try {
    console.log('🚀 Migration v39 : consolidation du schéma exécuté au démarrage...');
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS identifiant_national VARCHAR(100),
      ADD COLUMN IF NOT EXISTS password_provisoire VARCHAR(100);
      CREATE INDEX IF NOT EXISTS idx_users_identifiant_national ON users(identifiant_national);

      CREATE TABLE IF NOT EXISTS centres_examen_bac (
        id SERIAL PRIMARY KEY,
        nom_centre VARCHAR(255) NOT NULL,
        type_centre VARCHAR(50) DEFAULT 'PRINCIPAL',
        centre_principal_id INT REFERENCES centres_examen_bac(id) ON DELETE SET NULL,
        region VARCHAR(100) NOT NULL,
        zone_commune VARCHAR(100) NOT NULL,
        effectif_previsionnel INT DEFAULT 0,
        series_disponibles TEXT[] DEFAULT '{"S1", "S2", "L1", "L2"}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS office_bac_settings (
        id SERIAL PRIMARY KEY,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE etablissements
      ADD COLUMN IF NOT EXISTS admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS telephone VARCHAR(50),
      ADD COLUMN IF NOT EXISTS autorisation_numero VARCHAR(100),
      ADD COLUMN IF NOT EXISTS ia_nom VARCHAR(100),
      ADD COLUMN IF NOT EXISTS ief_nom VARCHAR(100),
      ADD COLUMN IF NOT EXISTS email_professionnel VARCHAR(255);

      ALTER TABLE professeurs
      ADD COLUMN IF NOT EXISTS sexe VARCHAR(10) DEFAULT 'M',
      ADD COLUMN IF NOT EXISTS cni_numero VARCHAR(50),
      ADD COLUMN IF NOT EXISTS matricule_solde VARCHAR(50),
      ADD COLUMN IF NOT EXISTS region VARCHAR(100),
      ADD COLUMN IF NOT EXISTS ville VARCHAR(100),
      ADD COLUMN IF NOT EXISTS etablissement_nom VARCHAR(255);

      ALTER TABLE demandes_inscription_office
      ADD COLUMN IF NOT EXISTS sexe VARCHAR(10) DEFAULT 'M',
      ADD COLUMN IF NOT EXISTS cni_numero VARCHAR(50),
      ADD COLUMN IF NOT EXISTS matricule_solde VARCHAR(50),
      ADD COLUMN IF NOT EXISTS documents_fournis TEXT,
      ADD COLUMN IF NOT EXISTS autorisation_numero VARCHAR(100),
      ADD COLUMN IF NOT EXISTS ia_nom VARCHAR(100),
      ADD COLUMN IF NOT EXISTS ief_nom VARCHAR(100);

      ALTER TABLE jurys_bac
      ADD COLUMN IF NOT EXISTS type_examen VARCHAR(50) DEFAULT 'BAC',
      ADD COLUMN IF NOT EXISTS centre_examen_id INT,
      ADD COLUMN IF NOT EXISTS centre_secondaire VARCHAR(150),
      ADD COLUMN IF NOT EXISTS identifiant_temporaire VARCHAR(150),
      ADD COLUMN IF NOT EXISTS mot_de_passe_temporaire VARCHAR(150),
      ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
      ADD COLUMN IF NOT EXISTS date_expiration_acces TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS statut_acces VARCHAR(50) DEFAULT 'ACTIF';

      ALTER TABLE livrets_scolaires_bac
      ADD COLUMN IF NOT EXISTS statut_transmission VARCHAR(50) DEFAULT 'EN_ATTENTE',
      ADD COLUMN IF NOT EXISTS restitue_at TIMESTAMP WITH TIME ZONE;

      -- Pré-inscriptions publiques
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

      -- Demandes d'attestation de scolarité
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

      -- Autorisations et téléchargements de bulletins
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

      -- Colonnes complémentaires élèves et établissements
      ALTER TABLE eleves ADD COLUMN IF NOT EXISTS sexe VARCHAR(10) DEFAULT 'M';
      ALTER TABLE eleves ADD COLUMN IF NOT EXISTS email VARCHAR(255);
      ALTER TABLE eleves ADD COLUMN IF NOT EXISTS lieu_naissance VARCHAR(100);
      ALTER TABLE eleves ADD COLUMN IF NOT EXISTS nationalite VARCHAR(100);
      ALTER TABLE eleves ADD COLUMN IF NOT EXISTS telephone VARCHAR(50);
      ALTER TABLE eleves ADD COLUMN IF NOT EXISTS coordonnees_parent TEXT;
      ALTER TABLE eleves ADD COLUMN IF NOT EXISTS justificatif_inapte_url TEXT;
      ALTER TABLE etablissements ADD COLUMN IF NOT EXISTS nom_directeur VARCHAR(255);

      -- Historique des notes
      CREATE TABLE IF NOT EXISTS historique_notes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
        ancienne_valeur NUMERIC,
        nouvelle_valeur NUMERIC,
        ancienne_appreciation TEXT,
        nouvelle_appreciation TEXT,
        motif TEXT,
        auteur_id UUID REFERENCES users(id) ON DELETE SET NULL,
        date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        statut VARCHAR(20) DEFAULT 'EN_ATTENTE'
      );
      ALTER TABLE historique_notes ADD COLUMN IF NOT EXISTS motif TEXT;
      ALTER TABLE historique_notes ADD COLUMN IF NOT EXISTS statut VARCHAR(20) DEFAULT 'EN_ATTENTE';

      -- Contrainte d'unicité sur les notes (autorise devoir ET composition pour une même période)
      ALTER TABLE notes DROP CONSTRAINT IF EXISTS unique_note_per_period;
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'unique_note_per_type'
        ) THEN
          ALTER TABLE notes ADD CONSTRAINT unique_note_per_type UNIQUE (eleve_id, matiere_id, semestre, type_note, trimestre);
        END IF;
      END $$;

      -- Messagerie et pièces jointes
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
    console.log('✅ Migration v39 exécutée avec succès !');
  } catch (err) {
    console.error('❌ Erreur migration v39:', err);
  } finally {
    process.exit();
  }
}

migrate();
