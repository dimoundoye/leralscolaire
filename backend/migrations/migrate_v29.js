require('dotenv').config();
const db = require('../src/config/db');

async function migrate() {
  try {
    console.log('🚀 Migration v29 : Création de la table jurys_bac pour le registre national des jurys et centres d\'examen...');

    await db.query(`
      CREATE TABLE IF NOT EXISTS jurys_bac (
        id SERIAL PRIMARY KEY,
        numero_jury VARCHAR(50) NOT NULL, -- ex: 'Jury 001', 'Jury 102'
        centre_examen VARCHAR(150) NOT NULL, -- ex: 'Lycée Lamine Guèye'
        region VARCHAR(50) NOT NULL DEFAULT 'Dakar',
        zone_commune VARCHAR(100), -- ex: 'Dakar Plateau', 'Thiès Nord'
        series_autorisees VARCHAR(100) DEFAULT 'S1, S2, L1, L2', -- séries prises en charge par le jury
        annee INT NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
        president_jury VARCHAR(150), -- Nom du Professeur Président du jury
        statut VARCHAR(20) DEFAULT 'ACTIF', -- 'ACTIF', 'FERMÉ'
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_jury_session UNIQUE(numero_jury, annee)
      );
    `);
    console.log('  ✓ Table jurys_bac créée');

    // Insérer quelques Jurys d'exemple officiels par région
    await db.query(`
      INSERT INTO jurys_bac (numero_jury, centre_examen, region, zone_commune, series_autorisees, annee, president_jury)
      VALUES 
        ('Jury 001', 'Lycée Lamine Guèye', 'Dakar', 'Dakar Plateau', 'S1, S2, L1, L2', 2026, 'Pr. Cheikh Anta Diop'),
        ('Jury 002', 'Lycée Delafosse', 'Dakar', 'Médina', 'STEG, G, T', 2026, 'Pr. Mariama Bâ'),
        ('Jury 003', 'Lycée Malick Sy', 'Thiès', 'Thiès Ville', 'S1, S2, L1, L2', 2026, 'Pr. Ousmane Socé Diop'),
        ('Jury 004', 'Lycée Charles de Gaulle', 'Saint-Louis', 'Saint-Louis Île', 'S1, S2, L1, L2', 2026, 'Pr. Aminata Sow Fall')
      ON CONFLICT DO NOTHING;
    `);
    console.log('  ✓ Jurys officiels initiaux insérés');

    console.log('✅ Migration v29 terminée avec succès !');
  } catch (err) {
    console.error('❌ Erreur migration v29:', err);
  } finally {
    process.exit();
  }
}

migrate();
