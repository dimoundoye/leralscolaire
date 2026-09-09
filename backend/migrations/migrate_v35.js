require('dotenv').config();
const db = require('../src/config/db');

async function migrate() {
  try {
    console.log("🚀 Migration v35 : Correction schéma Office du BAC (centres, jurys, professeurs, établissements)...");

    // 1. Table centres_examen_bac
    await db.query(`
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
    `);
    console.log('  ✓ Table centres_examen_bac créée');

    // 2. Table office_bac_settings
    await db.query(`
      CREATE TABLE IF NOT EXISTS office_bac_settings (
        id SERIAL PRIMARY KEY,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✓ Table office_bac_settings créée');

    // 3. Colonnes manquantes sur etablissements
    await db.query(`
      ALTER TABLE etablissements
      ADD COLUMN IF NOT EXISTS admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS telephone VARCHAR(50),
      ADD COLUMN IF NOT EXISTS autorisation_numero VARCHAR(100),
      ADD COLUMN IF NOT EXISTS ia_nom VARCHAR(100),
      ADD COLUMN IF NOT EXISTS ief_nom VARCHAR(100),
      ADD COLUMN IF NOT EXISTS email_professionnel VARCHAR(255);
    `);
    console.log('  ✓ Colonnes admin_id, telephone, etc. ajoutées à etablissements');

    // 4. Colonnes manquantes sur professeurs
    await db.query(`
      ALTER TABLE professeurs
      ADD COLUMN IF NOT EXISTS sexe VARCHAR(10) DEFAULT 'M',
      ADD COLUMN IF NOT EXISTS cni_numero VARCHAR(50),
      ADD COLUMN IF NOT EXISTS matricule_solde VARCHAR(50),
      ADD COLUMN IF NOT EXISTS region VARCHAR(100),
      ADD COLUMN IF NOT EXISTS ville VARCHAR(100),
      ADD COLUMN IF NOT EXISTS etablissement_nom VARCHAR(255);
    `);
    console.log('  ✓ Colonnes sexe, cni_numero, etc. ajoutées à professeurs');

    // 5. Colonnes sur demandes_inscription_office
    await db.query(`
      ALTER TABLE demandes_inscription_office
      ADD COLUMN IF NOT EXISTS sexe VARCHAR(10) DEFAULT 'M',
      ADD COLUMN IF NOT EXISTS cni_numero VARCHAR(50),
      ADD COLUMN IF NOT EXISTS matricule_solde VARCHAR(50),
      ADD COLUMN IF NOT EXISTS documents_fournis TEXT,
      ADD COLUMN IF NOT EXISTS autorisation_numero VARCHAR(100),
      ADD COLUMN IF NOT EXISTS ia_nom VARCHAR(100),
      ADD COLUMN IF NOT EXISTS ief_nom VARCHAR(100);
    `);
    console.log('  ✓ Colonnes sexe, cni_numero, documents_fournis, etc. ajoutées à demandes_inscription_office');

    // 6. Colonnes manquantes sur jurys_bac
    await db.query(`
      ALTER TABLE jurys_bac
      ADD COLUMN IF NOT EXISTS type_examen VARCHAR(50) DEFAULT 'BAC',
      ADD COLUMN IF NOT EXISTS centre_examen_id INT,
      ADD COLUMN IF NOT EXISTS centre_secondaire VARCHAR(150),
      ADD COLUMN IF NOT EXISTS identifiant_temporaire VARCHAR(150),
      ADD COLUMN IF NOT EXISTS mot_de_passe_temporaire VARCHAR(150),
      ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
      ADD COLUMN IF NOT EXISTS date_expiration_acces TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS statut_acces VARCHAR(50) DEFAULT 'ACTIF';
    `);
    console.log('  ✓ Colonnes type_examen, etc. ajoutées à jurys_bac');

    // 7. Colonnes sur livrets_scolaires_bac
    await db.query(`
      ALTER TABLE livrets_scolaires_bac
      ADD COLUMN IF NOT EXISTS statut_transmission VARCHAR(50) DEFAULT 'EN_ATTENTE',
      ADD COLUMN IF NOT EXISTS restitue_at TIMESTAMP WITH TIME ZONE;
    `);
    console.log('  ✓ Colonnes statut_transmission ajoutées à livrets_scolaires_bac');

    // 8. Insertion des centres d examen initiaux si la table est vide
    const centresCount = await db.query('SELECT COUNT(*) FROM centres_examen_bac');
    if (parseInt(centresCount.rows[0].count, 10) === 0) {
      await db.query(`
        INSERT INTO centres_examen_bac (nom_centre, type_centre, region, zone_commune, effectif_previsionnel, series_disponibles)
        VALUES 
          ('Lycée Lamine Guèye', 'PRINCIPAL', 'Dakar', 'Dakar Plateau', 450, '{"S1", "S2", "L1", "L2"}'),
          ('Lycée Delafosse', 'PRINCIPAL', 'Dakar', 'Médina', 400, '{"STEG", "G", "T"}'),
          ('Lycée Blaise Diagne', 'PRINCIPAL', 'Dakar', 'Fann-Point E', 500, '{"S1", "S2", "L1", "L2"}'),
          ('Lycée Limamoulaye', 'PRINCIPAL', 'Dakar', 'Guédiawaye', 600, '{"S1", "S2", "S3", "L1", "L2"}'),
          ('Lycée Malick Sy', 'PRINCIPAL', 'Thiès', 'Thiès Ville', 550, '{"S1", "S2", "L1", "L2"}'),
          ('Lycée Charles de Gaulle', 'PRINCIPAL', 'Saint-Louis', 'Saint-Louis Île', 380, '{"S1", "S2", "L1", "L2"}')
        ON CONFLICT DO NOTHING;
      `);
      console.log('  ✓ Centres d\'examen initiaux créés');
    }

    console.log('✅ Migration v35 exécutée avec succès !');
  } catch (err) {
    console.error('❌ Erreur migration v35:', err);
  } finally {
    process.exit();
  }
}

migrate();
