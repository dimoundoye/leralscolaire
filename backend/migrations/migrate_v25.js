require('dotenv').config();
const db = require('../src/config/db');

async function migrate() {
  try {
    console.log('🚀 Migration v25 : Enrichissement majeur du Module Office du BAC...');

    // 1. Extensions colonnes resultats_examens_nationaux
    await db.query(`
      ALTER TABLE resultats_examens_nationaux
      ADD COLUMN IF NOT EXISTS type_candidat VARCHAR(30) DEFAULT 'Scolaire',
      ADD COLUMN IF NOT EXISTS statut_redoublant BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS amenagement_handicap VARCHAR(100) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS absent_epreuve VARCHAR(20) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS tour_examen INTEGER DEFAULT 1,
      ADD COLUMN IF NOT EXISTS verrouille BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS qr_code_hash VARCHAR(255) DEFAULT NULL;
    `);
    console.log('  ✓ Colonnes type_candidat, redoublant, handicap, absence, tour, verrouille, qr_code ajoutées');

    // 2. Table pour les coefficients des épreuves par série
    await db.query(`
      CREATE TABLE IF NOT EXISTS bac_coefficients_series (
        id SERIAL PRIMARY KEY,
        serie VARCHAR(30) NOT NULL,
        matiere VARCHAR(100) NOT NULL,
        coefficient NUMERIC(4,2) NOT NULL DEFAULT 1.0,
        tour INTEGER DEFAULT 1,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✓ Table bac_coefficients_series créée');

    // 3. Préremplir les coefficients standards du Sénégal pour BAC (S1, S2, L1, L2, STEG)
    const countCoeffs = await db.query('SELECT COUNT(*) FROM bac_coefficients_series');
    if (parseInt(countCoeffs.rows[0].count) === 0) {
      await db.query(`
        INSERT INTO bac_coefficients_series (serie, matiere, coefficient, tour) VALUES
        -- Série S1
        ('S1', 'Mathématiques', 6.0, 1),
        ('S1', 'Sciences Physiques', 5.0, 1),
        ('S1', 'SVT', 2.0, 1),
        ('S1', 'Français', 3.0, 1),
        ('S1', 'Philosophie', 2.0, 1),
        ('S1', 'Anglais', 2.0, 1),
        ('S1', 'Histoire-Géo', 2.0, 1),
        -- Série S2
        ('S2', 'Mathématiques', 5.0, 1),
        ('S2', 'Sciences Physiques', 5.0, 1),
        ('S2', 'SVT', 5.0, 1),
        ('S2', 'Français', 3.0, 1),
        ('S2', 'Philosophie', 2.0, 1),
        ('S2', 'Anglais', 2.0, 1),
        -- Série L1 (L')
        ('L1', 'Français', 5.0, 1),
        ('L1', 'Philosophie', 5.0, 1),
        ('L1', 'Anglais', 4.0, 1),
        ('L1', 'Histoire-Géo', 4.0, 1),
        ('L1', 'Mathématiques', 2.0, 1),
        -- Série L2
        ('L2', 'Français', 5.0, 1),
        ('L2', 'Philosophie', 4.0, 1),
        ('L2', 'Histoire-Géo', 5.0, 1),
        ('L2', 'Anglais', 3.0, 1),
        ('L2', 'Mathématiques', 2.0, 1),
        -- Série STEG
        ('STEG', 'Comptabilité', 5.0, 1),
        ('STEG', 'Économie & Droit', 4.0, 1),
        ('STEG', 'Mathématiques', 4.0, 1),
        ('STEG', 'Français', 3.0, 1),
        ('STEG', 'Anglais', 2.0, 1);
      `);
      console.log('  ✓ Coefficients initiaux des séries insérés (S1, S2, L1, L2, STEG)');
    }

    console.log('✅ Migration v25 terminée avec succès !');
  } catch (err) {
    console.error('❌ Erreur migration v25:', err);
  } finally {
    process.exit();
  }
}

migrate();
