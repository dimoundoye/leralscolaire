require('dotenv').config();
const db = require('../src/config/db');

async function migrate() {
  try {
    console.log('🚀 Migration v33 : Création des tables d\'émargement, d\'évaluation élèves et de profilage prof...');

    // 1. Table seances_cours (Planification et suivi des cours)
    await db.query(`
      CREATE TABLE IF NOT EXISTS seances_cours (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        etablissement_id UUID REFERENCES etablissements(id) ON DELETE CASCADE,
        professeur_id UUID REFERENCES users(id) ON DELETE CASCADE,
        classe_id UUID REFERENCES classes(id) ON DELETE CASCADE,
        matiere_code VARCHAR(50),
        matiere_nom VARCHAR(100),
        date_seance DATE NOT NULL,
        heure_debut TIME NOT NULL,
        heure_fin TIME NOT NULL,
        type_seance VARCHAR(30) DEFAULT 'REGULIER', -- 'REGULIER', 'RATTRAPAGE', 'EPS_OUTDOOR'
        statut_rattrapage VARCHAR(30) DEFAULT 'NONE', -- 'NONE', 'DEMANDE', 'APPROUVE', 'REJETE'
        motif_rattrapage VARCHAR(255),
        statut VARCHAR(30) DEFAULT 'PROGRAMME', -- 'PROGRAMME', 'EMARGE_PRESENCE', 'VALIDE_COMPLET', 'ABSENT', 'CONTESTE'
        cahier_texte_titre VARCHAR(255),
        cahier_texte_contenu TEXT,
        cahier_texte_devoirs TEXT,
        date_remplissage_cahier TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✓ Table seances_cours créée');

    // 2. Table emargements (Scan QR Code + GPS + Signature)
    await db.query(`
      CREATE TABLE IF NOT EXISTS emargements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        seance_id UUID REFERENCES seances_cours(id) ON DELETE CASCADE,
        professeur_id UUID REFERENCES users(id) ON DELETE CASCADE,
        etablissement_id UUID REFERENCES etablissements(id) ON DELETE CASCADE,
        mode_emargement VARCHAR(30) NOT NULL, -- 'QR_SCAN_20S', 'EPS_GPS_TERRAIN', 'SUBSTITUTE_SCAN'
        horodatage_scan TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        latitude NUMERIC(10, 7),
        longitude NUMERIC(10, 7),
        distance_etablissement_metres INT,
        token_totp_utilise VARCHAR(255),
        statut VARCHAR(30) DEFAULT 'VALIDE', -- 'VALIDE', 'SUSPECT', 'CONTESTE', 'ANNULE'
        remarque_surveillant TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✓ Table emargements créée');

    // 3. Table campagnes_evaluation_eleves (Fenêtre de vote post-2nd semestre)
    await db.query(`
      CREATE TABLE IF NOT EXISTS campagnes_evaluation_eleves (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        etablissement_id UUID REFERENCES etablissements(id) ON DELETE CASCADE,
        annee_scolaire VARCHAR(20) NOT NULL DEFAULT '2025-2026',
        semestre INT DEFAULT 2,
        date_ouverture TIMESTAMP WITH TIME ZONE NOT NULL,
        date_limite TIMESTAMP WITH TIME ZONE NOT NULL,
        statut VARCHAR(20) DEFAULT 'OUVERTE', -- 'CREEE', 'OUVERTE', 'CLOTUREE'
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✓ Table campagnes_evaluation_eleves créée');

    // 4. Table evaluations_eleves (Vote anonyme 5 questions)
    await db.query(`
      CREATE TABLE IF NOT EXISTS evaluations_eleves (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        campagne_id UUID REFERENCES campagnes_evaluation_eleves(id) ON DELETE CASCADE,
        professeur_id UUID REFERENCES users(id) ON DELETE CASCADE,
        etablissement_id UUID REFERENCES etablissements(id) ON DELETE CASCADE,
        eleve_hash VARCHAR(64) NOT NULL, -- Anonymisation cryptographique de l'élève
        q1_pedagogie INT CHECK (q1_pedagogie BETWEEN 1 AND 5), -- Clarté des cours
        q2_assiduite INT CHECK (q2_assiduite BETWEEN 1 AND 5), -- Respect des horaires
        q3_ecoute INT CHECK (q3_ecoute BETWEEN 1 AND 5), -- Écoute & Disponibilité
        q4_corrections INT CHECK (q4_corrections BETWEEN 1 AND 5), -- Qualité des corrections
        q5_climat INT CHECK (q5_climat BETWEEN 1 AND 5), -- Climat de classe
        commentaire TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✓ Table evaluations_eleves créée');

    // 5. Mettre à jour la table professeurs avec les données de profilage Office du BAC
    await db.query(`
      ALTER TABLE professeurs 
      ADD COLUMN IF NOT EXISTS matricule_national VARCHAR(50),
      ADD COLUMN IF NOT EXISTS note_inspection NUMERIC(4, 2) DEFAULT 16.50,
      ADD COLUMN IF NOT EXISTS diplome_eleve VARCHAR(150) DEFAULT 'Master / CAPES',
      ADD COLUMN IF NOT EXISTS parcours_academique TEXT,
      ADD COLUMN IF NOT EXISTS photo_url TEXT,
      ADD COLUMN IF NOT EXISTS est_eligible_jury_bac BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS nombre_participations_bac INT DEFAULT 3;
    `);
    console.log('  ✓ Colonnes de profilage ajoutées à la table professeurs');

    // Index de performance
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_seances_prof ON seances_cours(professeur_id);
      CREATE INDEX IF NOT EXISTS idx_seances_etab ON seances_cours(etablissement_id);
      CREATE INDEX IF NOT EXISTS idx_seances_date ON seances_cours(date_seance);
      CREATE INDEX IF NOT EXISTS idx_emarg_seance ON emargements(seance_id);
      CREATE INDEX IF NOT EXISTS idx_eval_prof ON evaluations_eleves(professeur_id);
    `);
    console.log('  ✓ Index de performance créés');

    console.log('✅ Migration v33 exécutée avec succès !');
  } catch (err) {
    console.error('❌ Erreur migration v33:', err);
  } finally {
    process.exit();
  }
}

migrate();
