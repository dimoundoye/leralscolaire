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
    role VARCHAR(50) CHECK (role IN ('SUPER_ADMIN', 'ADMIN_ETABLISSEMENT', 'PROFESSEUR', 'ELEVE', 'AGENT_OFFICE')),
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

