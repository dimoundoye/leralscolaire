require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const db = require('../config/db');

async function run() {
  try {
    const query = `
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
    `;
    await db.query(query);

    // Create bulletins_autorises table
    await db.query(`
      CREATE TABLE IF NOT EXISTS bulletins_autorises (
        id SERIAL PRIMARY KEY,
        classe_id UUID REFERENCES classes(id) ON DELETE CASCADE,
        semestre INT NOT NULL,
        annee_scolaire VARCHAR(20) NOT NULL,
        autorise BOOLEAN DEFAULT FALSE,
        UNIQUE (classe_id, semestre, annee_scolaire)
      );
    `);

    // Create bulletins_telechargements table
    await db.query(`
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
    
    // Migration for existing database tables
    await db.query("ALTER TABLE demandes_attestation ADD COLUMN IF NOT EXISTS classe_id UUID REFERENCES classes(id) ON DELETE SET NULL;");
    await db.query("ALTER TABLE demandes_attestation ADD COLUMN IF NOT EXISTS deja_telecharge BOOLEAN DEFAULT FALSE;");
    await db.query("ALTER TABLE demandes_attestation ADD COLUMN IF NOT EXISTS date_telechargement TIMESTAMP;");
    await db.query("ALTER TABLE etablissements ADD COLUMN IF NOT EXISTS nom_directeur VARCHAR(255);");

    // Backfill classe_id for legacy records
    await db.query(`
      UPDATE demandes_attestation da
      SET classe_id = COALESCE(
        (
          SELECT ic.classe_id 
          FROM inscription_classes ic 
          WHERE ic.eleve_id = da.eleve_id
          ORDER BY ABS(EXTRACT(EPOCH FROM (ic.date_inscription - da.date_demande))) ASC
          LIMIT 1
        ),
        (
          SELECT ic.classe_id 
          FROM inscription_classes ic 
          WHERE ic.eleve_id = da.eleve_id
          ORDER BY ic.date_inscription DESC
          LIMIT 1
        )
      )
      WHERE da.classe_id IS NULL;
    `);

    console.log('Table demandes_attestation created, migrated, and legacy data backfilled successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error creating table:', err);
    process.exit(1);
  }
}

run();
