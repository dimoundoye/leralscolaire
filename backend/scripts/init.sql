-- Initialisation de la base de données LeralScolaire

-- Extension pour les UUID si nécessaire
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table des Etablissements
CREATE TABLE IF NOT EXISTS etablissements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code_etablissement VARCHAR(50) UNIQUE NOT NULL,
    nom VARCHAR(255) NOT NULL,
    region VARCHAR(100) NOT NULL,
    ville VARCHAR(100) NOT NULL,
    nom_directeur VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table des Utilisateurs (Authentification)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('SUPER_ADMIN', 'ADMIN_ETABLISSEMENT', 'PROFESSEUR', 'ELEVE', 'AGENT_OFFICE', 'OFFICE_BAC')),
    identifiant_national VARCHAR(100),
    password_provisoire VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table des Eleves
CREATE TABLE IF NOT EXISTS eleves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    identifiant_national VARCHAR(50) UNIQUE NOT NULL, -- Format: SN-2025-AAA-000123
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    etablissement_id UUID REFERENCES etablissements(id),
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    date_naissance DATE,
    sexe VARCHAR(10) DEFAULT 'M' CHECK (sexe IN ('M', 'F')),
    photo_url TEXT,
    statut VARCHAR(20) DEFAULT 'APTE' CHECK (statut IN ('APTE', 'INAPTE')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Table des Classes
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(100) NOT NULL, -- ex: 6ème A, Terminale S1
    niveau VARCHAR(50),        -- ex: 6eme, 5eme... Terminale
    etablissement_id UUID REFERENCES etablissements(id) ON DELETE CASCADE,
    annee_scolaire VARCHAR(20) NOT NULL -- ex: 2025-2026
);

-- 5. Table de liaison Eleves-Classes (pour historique)
CREATE TABLE IF NOT EXISTS inscription_classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    eleve_id UUID REFERENCES eleves(id) ON DELETE CASCADE,
    classe_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    date_inscription TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Table des Matieres
CREATE TABLE IF NOT EXISTS matieres (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(100) NOT NULL,
    code_matiere VARCHAR(10) UNIQUE NOT NULL -- ex: MATH, PC, SVT
);

-- 7. Table des Notes
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    eleve_id UUID REFERENCES eleves(id) ON DELETE CASCADE,
    matiere_id UUID REFERENCES matieres(id),
    valeur DECIMAL(4,2) CHECK (valeur >= 0 AND valeur <= 20),
    coefficient INTEGER DEFAULT 1,
    type_note VARCHAR(20) CHECK (type_note IN ('DEVOIR', 'COMPOSITION', 'EXAMEN')),
    semestre INTEGER DEFAULT 1,
    trimestre INTEGER,
    appreciation TEXT,
    professeur_id UUID REFERENCES users(id),
    date_saisie TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Table d'Historique des Notes
CREATE TABLE IF NOT EXISTS historique_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
    ancienne_valeur DECIMAL(4,2),
    nouvelle_valeur DECIMAL(4,2),
    ancienne_appreciation TEXT,
    nouvelle_appreciation TEXT,
    auteur_id UUID REFERENCES users(id),
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Table des Pré-inscriptions
CREATE TABLE IF NOT EXISTS pre_inscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    classe_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    etablissement_id UUID REFERENCES etablissements(id) ON DELETE CASCADE,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    sexe VARCHAR(10) DEFAULT 'M' CHECK (sexe IN ('M', 'F')),
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

-- 10. Table des Demandes d'Attestation
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

-- 11. Tables des Bulletins Autorisés et Téléchargements
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

-- 12. Table des Messages et Notifications
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expediteur_id UUID REFERENCES users(id) ON DELETE CASCADE,
    destinataire_type VARCHAR(50) CHECK (destinataire_type IN ('CLASSE', 'ELEVE', 'OFFICE_BAC', 'PROFESSEUR', 'ADMIN_ETABLISSEMENT', 'ALL_PROFESSEURS')),
    destinataire_id UUID,
    sujet VARCHAR(255),
    contenu TEXT NOT NULL,
    date_envoi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lu BOOLEAN DEFAULT FALSE,
    etablissement_id UUID REFERENCES etablissements(id) ON DELETE CASCADE,
    fichier_url TEXT,
    fichier_nom VARCHAR(255)
);



