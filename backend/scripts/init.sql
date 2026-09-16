-- ===================================================================
-- SCHEMA COMPLET LERALSCOLAIRE - TOUTES LES TABLES ET COLONNES (44 TABLES)
-- Généré automatiquement pour alignement parfait avec le backend
-- ===================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: absences
CREATE TABLE IF NOT EXISTS absences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    eleve_id UUID,
    date_absence DATE DEFAULT CURRENT_DATE,
    justifiee BOOLEAN DEFAULT false,
    points_deduits INTEGER DEFAULT 0,
    heures_absent INTEGER DEFAULT 1,
    type_presence VARCHAR(20) DEFAULT 'ABSENCE'::character varying,
    duree_retard INTEGER DEFAULT 0,
    matiere_id UUID,
    classe_id UUID,
    professeur_id UUID,
    motif TEXT,
    motif_justification TEXT
);

-- Table: bac_coefficients_series
CREATE TABLE IF NOT EXISTS bac_coefficients_series (
    id SERIAL PRIMARY KEY,
    serie VARCHAR(30) NOT NULL,
    matiere VARCHAR(100) NOT NULL,
    coefficient NUMERIC DEFAULT 1.0 NOT NULL,
    tour INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: baremes_appreciation
CREATE TABLE IF NOT EXISTS baremes_appreciation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    etablissement_id UUID,
    note_min NUMERIC NOT NULL,
    note_max NUMERIC NOT NULL,
    appreciation TEXT NOT NULL,
    couleur VARCHAR(20) DEFAULT '#64748b'::character varying,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: bulletins
CREATE TABLE IF NOT EXISTS bulletins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    eleve_id UUID,
    periode VARCHAR(50),
    annee_scolaire VARCHAR(20),
    moyenne_generale NUMERIC,
    decision VARCHAR(50),
    qr_code_data TEXT,
    pdf_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    classe_id UUID,
    decision_detail TEXT,
    decision_auto BOOLEAN DEFAULT true,
    observations_jury TEXT,
    appreciations_conseil TEXT
);

-- Table: bulletins_autorises
CREATE TABLE IF NOT EXISTS bulletins_autorises (
    id SERIAL PRIMARY KEY,
    classe_id UUID,
    semestre INTEGER NOT NULL,
    annee_scolaire VARCHAR(20) NOT NULL,
    autorise BOOLEAN DEFAULT false
);

-- Table: bulletins_telechargements
CREATE TABLE IF NOT EXISTS bulletins_telechargements (
    id SERIAL PRIMARY KEY,
    eleve_id UUID,
    classe_id UUID,
    semestre INTEGER NOT NULL,
    annee_scolaire VARCHAR(20) NOT NULL,
    telecharge_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: cahier_de_texte
CREATE TABLE IF NOT EXISTS cahier_de_texte (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    etablissement_id UUID,
    classe_id UUID,
    matiere_id UUID,
    professeur_id UUID,
    date_seance DATE DEFAULT CURRENT_DATE NOT NULL,
    heure_debut VARCHAR(10),
    heure_fin VARCHAR(10),
    titre_lecon VARCHAR(255) NOT NULL,
    contenu_seance TEXT NOT NULL,
    travail_a_faire TEXT,
    date_remise_devoir DATE,
    fichier_url TEXT,
    fichier_nom TEXT,
    visa_admin BOOLEAN DEFAULT false,
    date_visa TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: campagnes_evaluation_eleves
CREATE TABLE IF NOT EXISTS campagnes_evaluation_eleves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    etablissement_id UUID,
    annee_scolaire VARCHAR(20) DEFAULT '2025-2026'::character varying NOT NULL,
    semestre INTEGER DEFAULT 2,
    date_ouverture TIMESTAMP WITH TIME ZONE NOT NULL,
    date_limite TIMESTAMP WITH TIME ZONE NOT NULL,
    statut VARCHAR(20) DEFAULT 'OUVERTE'::character varying,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: centres_examen_bac
CREATE TABLE IF NOT EXISTS centres_examen_bac (
    id SERIAL PRIMARY KEY,
    nom_centre VARCHAR(255) NOT NULL,
    region VARCHAR(100) NOT NULL,
    zone_commune VARCHAR(100) NOT NULL,
    effectif_previsionnel INTEGER DEFAULT 0,
    series_disponibles TEXT[] DEFAULT ARRAY['S1'::text, 'S2'::text, 'L1'::text, 'L2'::text, 'STEG'::text],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    type_centre VARCHAR(20) DEFAULT 'PRINCIPAL'::character varying,
    centre_principal_id INTEGER
);

-- Table: classe_matieres
CREATE TABLE IF NOT EXISTS classe_matieres (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    classe_id UUID,
    matiere_id UUID,
    coefficient INTEGER DEFAULT 1
);

-- Table: classes
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(100) NOT NULL,
    niveau VARCHAR(50),
    etablissement_id UUID,
    annee_scolaire VARCHAR(20) NOT NULL
);

-- Table: demandes_attestation
CREATE TABLE IF NOT EXISTS demandes_attestation (
    id SERIAL PRIMARY KEY,
    eleve_id UUID,
    etablissement_id UUID,
    statut VARCHAR(20) DEFAULT 'EN_ATTENTE'::character varying,
    motif_refus TEXT,
    motif_demande TEXT,
    date_demande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_traitement TIMESTAMP,
    classe_id UUID,
    deja_telecharge BOOLEAN DEFAULT false,
    date_telechargement TIMESTAMP
);

-- Table: demandes_inscription_office
CREATE TABLE IF NOT EXISTS demandes_inscription_office (
    id SERIAL PRIMARY KEY,
    type_demande VARCHAR(30) NOT NULL,
    nom VARCHAR(150) NOT NULL,
    prenom VARCHAR(150),
    email VARCHAR(150) NOT NULL,
    telephone VARCHAR(50),
    region VARCHAR(50) DEFAULT 'Dakar'::character varying NOT NULL,
    ville VARCHAR(100),
    specialite_ou_code VARCHAR(100),
    statut VARCHAR(30) DEFAULT 'EN_ATTENTE'::character varying,
    motif_rejet TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    documents_fournis JSONB DEFAULT '{}'::jsonb,
    cni_numero VARCHAR(50),
    autorisation_numero VARCHAR(100),
    matricule_solde VARCHAR(50),
    sexe VARCHAR(10) DEFAULT 'M'::character varying,
    ia_nom VARCHAR(100),
    ief_nom VARCHAR(100)
);

-- Table: documents_partages
CREATE TABLE IF NOT EXISTS documents_partages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expediteur_etablissement_id UUID,
    destinataire_etablissement_id UUID,
    eleve_id UUID,
    nom_fichier VARCHAR(255) NOT NULL,
    chemin_fichier TEXT NOT NULL,
    taille BIGINT,
    type_fichier VARCHAR(100),
    description TEXT,
    date_envoi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lu BOOLEAN DEFAULT false
);

-- Table: eleves
CREATE TABLE IF NOT EXISTS eleves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    identifiant_national VARCHAR(50) NOT NULL,
    user_id UUID,
    etablissement_id UUID,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    date_naissance DATE,
    photo_url TEXT,
    statut VARCHAR(20) DEFAULT 'APTE'::character varying,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lieu_naissance VARCHAR(100),
    nationalite VARCHAR(100),
    telephone VARCHAR(20),
    coordonnees_parent TEXT,
    sexe VARCHAR(10) DEFAULT 'M'::character varying,
    justificatif_inapte_url TEXT,
    email VARCHAR(255)
);

-- Table: emargements
CREATE TABLE IF NOT EXISTS emargements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seance_id UUID,
    professeur_id UUID,
    etablissement_id UUID,
    mode_emargement VARCHAR(30) NOT NULL,
    horodatage_scan TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    latitude NUMERIC,
    longitude NUMERIC,
    distance_etablissement_metres INTEGER,
    token_totp_utilise VARCHAR(255),
    statut VARCHAR(30) DEFAULT 'VALIDE'::character varying,
    remarque_surveillant TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: emplois_du_temps
CREATE TABLE IF NOT EXISTS emplois_du_temps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    classe_id UUID,
    matiere_id UUID,
    professeur_id UUID,
    jour_semaine VARCHAR(20) NOT NULL,
    heure_debut TIME WITHOUT TIME ZONE NOT NULL,
    heure_fin TIME WITHOUT TIME ZONE NOT NULL,
    salle VARCHAR(50)
);

-- Table: etablissements
CREATE TABLE IF NOT EXISTS etablissements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code_etablissement VARCHAR(50) NOT NULL,
    nom VARCHAR(255) NOT NULL,
    region VARCHAR(100) NOT NULL,
    ville VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    admin_id UUID,
    signature_url TEXT,
    cachet_url TEXT,
    nom_directeur VARCHAR(255),
    zone_examen VARCHAR(100),
    telephone VARCHAR(255),
    autorisation_numero VARCHAR(255),
    ia_nom VARCHAR(100),
    ief_nom VARCHAR(100),
    email_professionnel VARCHAR(255)
);

-- Table: evaluations_eleves
CREATE TABLE IF NOT EXISTS evaluations_eleves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campagne_id UUID,
    professeur_id UUID,
    etablissement_id UUID,
    eleve_hash VARCHAR(64) NOT NULL,
    q1_pedagogie INTEGER,
    q2_assiduite INTEGER,
    q3_ecoute INTEGER,
    q4_corrections INTEGER,
    q5_climat INTEGER,
    commentaire TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: examens_planification
CREATE TABLE IF NOT EXISTS examens_planification (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    etablissement_id UUID,
    classe_id UUID,
    matiere_id UUID,
    type_examen VARCHAR(20),
    date_examen TIMESTAMP NOT NULL,
    salle VARCHAR(50),
    statut VARCHAR(30) DEFAULT 'VALIDE'::character varying,
    professeur_id UUID
);

-- Table: historique_notes
CREATE TABLE IF NOT EXISTS historique_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    note_id UUID,
    ancienne_valeur NUMERIC,
    nouvelle_valeur NUMERIC,
    ancienne_appreciation TEXT,
    nouvelle_appreciation TEXT,
    auteur_id UUID,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    motif TEXT,
    statut VARCHAR(20) DEFAULT 'EN_ATTENTE'::character varying
);

-- Table: inscription_classes
CREATE TABLE IF NOT EXISTS inscription_classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    eleve_id UUID,
    classe_id UUID,
    date_inscription TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: inspections_academie
CREATE TABLE IF NOT EXISTS inspections_academie (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    region VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

-- Table: inspections_education_formation
CREATE TABLE IF NOT EXISTS inspections_education_formation (
    id SERIAL PRIMARY KEY,
    ia_id INTEGER NOT NULL,
    nom VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

-- Table: jurys_bac
CREATE TABLE IF NOT EXISTS jurys_bac (
    id SERIAL PRIMARY KEY,
    numero_jury VARCHAR(50) NOT NULL,
    centre_examen VARCHAR(150) NOT NULL,
    region VARCHAR(50) DEFAULT 'Dakar'::character varying NOT NULL,
    zone_commune VARCHAR(100),
    series_autorisees VARCHAR(100) DEFAULT 'S1, S2, L1, L2'::character varying,
    annee INTEGER DEFAULT EXTRACT(year FROM CURRENT_DATE) NOT NULL,
    president_jury VARCHAR(150),
    statut VARCHAR(20) DEFAULT 'ACTIF'::character varying,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    president_prof_id UUID,
    type_examen VARCHAR(20) DEFAULT 'BAC'::character varying,
    capacite_max INTEGER DEFAULT 120,
    identifiant_temporaire VARCHAR(120),
    mot_de_passe_temporaire VARCHAR(100),
    password_hash VARCHAR(255),
    date_expiration_acces TIMESTAMP,
    statut_acces VARCHAR(20) DEFAULT 'ACTIF'::character varying,
    centre_examen_id INTEGER,
    centre_secondaire VARCHAR(255)
);

-- Table: livrets_scolaires_bac
CREATE TABLE IF NOT EXISTS livrets_scolaires_bac (
    id SERIAL PRIMARY KEY,
    eleve_id UUID,
    etablissement_id UUID,
    annee INTEGER DEFAULT EXTRACT(year FROM CURRENT_DATE) NOT NULL,
    serie VARCHAR(20) NOT NULL,
    moyenne_seconde NUMERIC,
    moyenne_premiere NUMERIC,
    moyenne_terminale NUMERIC,
    appreciation_conseil TEXT,
    fichier_livret_url VARCHAR(255),
    statut_validation VARCHAR(30) DEFAULT 'RÉCEPTIONNÉ'::character varying,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    statut_transmission VARCHAR(50) DEFAULT 'NON_TRANSMIS'::character varying,
    transmis_at TIMESTAMP,
    restitue_at TIMESTAMP
);

-- Table: matieres
CREATE TABLE IF NOT EXISTS matieres (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(100) NOT NULL,
    code_matiere VARCHAR(10) NOT NULL
);

-- Table: messages
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expediteur_id UUID,
    destinataire_type VARCHAR(20),
    destinataire_id UUID,
    sujet VARCHAR(255),
    contenu TEXT NOT NULL,
    date_envoi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lu BOOLEAN DEFAULT false,
    etablissement_id UUID,
    fichier_url TEXT,
    fichier_nom TEXT
);

-- Table: notes
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    eleve_id UUID,
    matiere_id UUID,
    valeur NUMERIC,
    coefficient INTEGER DEFAULT 1,
    type_note VARCHAR(20),
    trimestre INTEGER,
    professeur_id UUID,
    date_saisie TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    semestre INTEGER DEFAULT 1,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    appreciation TEXT,
    etablissement_origine_id UUID,
    classe_id UUID
);

-- Table: notes_candidats_bac
CREATE TABLE IF NOT EXISTS notes_candidats_bac (
    id SERIAL PRIMARY KEY,
    candidat_id UUID,
    matiere_code VARCHAR(50) NOT NULL,
    matiere_nom VARCHAR(100) NOT NULL,
    note NUMERIC,
    coefficient INTEGER DEFAULT 1 NOT NULL,
    statut_presence VARCHAR(20) DEFAULT 'PRESENT'::character varying,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    note_2nd_tour NUMERIC DEFAULT NULL::numeric
);

-- Table: notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    titre VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'GENERAL'::character varying,
    lu BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: office_bac_settings
CREATE TABLE IF NOT EXISTS office_bac_settings (
    setting_key VARCHAR(50) NOT NULL,
    setting_value TEXT,
    updated_at TIMESTAMP DEFAULT now()
);

-- Table: password_resets
CREATE TABLE IF NOT EXISTS password_resets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: portfolio_items
CREATE TABLE IF NOT EXISTS portfolio_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    eleve_id UUID,
    type VARCHAR(50),
    titre VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    annee_scolaire VARCHAR(20) NOT NULL,
    date_realisation DATE NOT NULL,
    media_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: pre_inscriptions
CREATE TABLE IF NOT EXISTS pre_inscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    classe_id UUID,
    etablissement_id UUID,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    date_naissance DATE,
    lieu_naissance VARCHAR(100),
    nationalite VARCHAR(100),
    telephone VARCHAR(50),
    coordonnees_parent TEXT,
    statut VARCHAR(20) DEFAULT 'APTE'::character varying,
    statut_validation VARCHAR(20) DEFAULT 'EN_ATTENTE'::character varying,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    identifiant_existant VARCHAR(50),
    photo_url TEXT,
    sexe VARCHAR(10) DEFAULT 'M'::character varying,
    email VARCHAR(255)
);

-- Table: professeur_matieres
CREATE TABLE IF NOT EXISTS professeur_matieres (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professeur_id UUID,
    matiere_id UUID,
    classe_id UUID
);

-- Table: professeurs
CREATE TABLE IF NOT EXISTS professeurs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    telephone VARCHAR(50),
    matiere_principale VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sexe VARCHAR(10) DEFAULT 'M'::character varying,
    cni_numero VARCHAR(255),
    matricule_solde VARCHAR(255),
    region VARCHAR(255),
    ville VARCHAR(255),
    matricule_national VARCHAR(50),
    note_inspection NUMERIC DEFAULT 16.50,
    diplome_eleve VARCHAR(150) DEFAULT 'Master / CAPES'::character varying,
    parcours_academique TEXT,
    photo_url TEXT,
    est_eligible_jury_bac BOOLEAN DEFAULT true,
    nombre_participations_bac INTEGER DEFAULT 3,
    etablissement_nom VARCHAR(255)
);

-- Table: professeurs_etablissements
CREATE TABLE IF NOT EXISTS professeurs_etablissements (
    professeur_id UUID NOT NULL,
    etablissement_id UUID NOT NULL,
    statut VARCHAR(20) DEFAULT 'EN_ATTENTE'::character varying,
    date_invitation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_reponse TIMESTAMP,
    droit_envoi_message BOOLEAN DEFAULT false
);

-- Table: regles_passage
CREATE TABLE IF NOT EXISTS regles_passage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    etablissement_id UUID,
    seuil_passage_direct NUMERIC DEFAULT 12.00,
    seuil_passage NUMERIC DEFAULT 10.00,
    seuil_cours_vacances NUMERIC DEFAULT 8.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: resultats_examens_nationaux
CREATE TABLE IF NOT EXISTS resultats_examens_nationaux (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    eleve_id UUID,
    type_examen VARCHAR(20),
    annee VARCHAR(4) NOT NULL,
    session VARCHAR(50) DEFAULT 'Normale'::character varying,
    serie VARCHAR(50),
    mention VARCHAR(50),
    moyenne NUMERIC,
    statut_resultat VARCHAR(20),
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    numero_table VARCHAR(50),
    jury VARCHAR(100),
    centre_examen VARCHAR(200),
    statut_candidat VARCHAR(30) DEFAULT 'CONVOQUÉ'::character varying,
    appreciation_jury TEXT,
    details_epreuves JSONB,
    date_deliberation DATE,
    publie BOOLEAN DEFAULT false,
    region VARCHAR(100),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    statut_dossier VARCHAR(30) DEFAULT 'VALIDÉ'::character varying,
    motif_suspension TEXT,
    type_candidat VARCHAR(30) DEFAULT 'Scolaire'::character varying,
    statut_redoublant BOOLEAN DEFAULT false,
    amenagement_handicap VARCHAR(100) DEFAULT NULL::character varying,
    absent_epreuve VARCHAR(20) DEFAULT NULL::character varying,
    tour_examen INTEGER DEFAULT 1,
    verrouille BOOLEAN DEFAULT false,
    qr_code_hash VARCHAR(255) DEFAULT NULL::character varying,
    statut_deliberation VARCHAR(30) DEFAULT 'EN_ATTENTE'::character varying,
    repeche BOOLEAN DEFAULT false,
    pv_signe_at TIMESTAMP WITH TIME ZONE
);

-- Table: seances_cours
CREATE TABLE IF NOT EXISTS seances_cours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    etablissement_id UUID,
    professeur_id UUID,
    classe_id UUID,
    matiere_code VARCHAR(50),
    matiere_nom VARCHAR(100),
    date_seance DATE NOT NULL,
    heure_debut TIME WITHOUT TIME ZONE NOT NULL,
    heure_fin TIME WITHOUT TIME ZONE NOT NULL,
    type_seance VARCHAR(30) DEFAULT 'REGULIER'::character varying,
    statut_rattrapage VARCHAR(30) DEFAULT 'NONE'::character varying,
    motif_rattrapage VARCHAR(255),
    statut VARCHAR(30) DEFAULT 'PROGRAMME'::character varying,
    cahier_texte_titre VARCHAR(255),
    cahier_texte_contenu TEXT,
    cahier_texte_devoirs TEXT,
    date_remplissage_cahier TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: signalements_discipline
CREATE TABLE IF NOT EXISTS signalements_discipline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    etablissement_id UUID,
    eleve_id UUID,
    auteur_id UUID,
    auteur_type VARCHAR(30) DEFAULT 'PROFESSEUR'::character varying NOT NULL,
    type_action VARCHAR(30) NOT NULL,
    gravite VARCHAR(20) DEFAULT 'INFO'::character varying,
    matiere_code VARCHAR(50),
    matiere_nom VARCHAR(100),
    motif VARCHAR(255) NOT NULL,
    description TEXT,
    date_rendez_vous TIMESTAMP WITH TIME ZONE,
    lieu_rendez_vous VARCHAR(150),
    statut VARCHAR(30) DEFAULT 'TRANSMIS'::character varying,
    compte_rendu_rdv TEXT,
    notifie_email BOOLEAN DEFAULT false,
    notifie_sms BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: transferts_eleves
CREATE TABLE IF NOT EXISTS transferts_eleves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    eleve_id UUID,
    ancien_etablissement_id UUID,
    nouveau_etablissement_id UUID,
    motif TEXT,
    date_transfert TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    statut_transfert VARCHAR(20) DEFAULT 'EN_ATTENTE'::character varying
);

-- Table: users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    identifiant_national VARCHAR(50),
    password_provisoire VARCHAR(100)
);

