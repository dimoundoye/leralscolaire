const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const db = require('../src/config/db');

async function migrate() {
  try {
    // Create baremes_appreciation table
    await db.query(`
      CREATE TABLE IF NOT EXISTS baremes_appreciation (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        etablissement_id UUID REFERENCES etablissements(id) ON DELETE CASCADE,
        note_min NUMERIC NOT NULL,
        note_max NUMERIC NOT NULL,
        appreciation TEXT NOT NULL,
        couleur VARCHAR(20) DEFAULT '#64748b',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(etablissement_id, note_min, note_max)
      )
    `);
    console.log('Table baremes_appreciation créée avec succès.');

    // Seed default baremes for existing etablissements
    const { rows: etabs } = await db.query(`SELECT id FROM etablissements`);
    for (const etab of etabs) {
      const defaultBaremes = [
        { min: 0,  max: 4,  label: 'Très Faible',  color: '#ef4444' },
        { min: 4.01, max: 7, label: 'Faible',      color: '#f97316' },
        { min: 7.01, max: 9, label: 'Insuffisant', color: '#f59e0b' },
        { min: 9.01, max: 11, label: 'Passable',   color: '#eab308' },
        { min: 11.01, max: 13, label: 'Assez Bien',color: '#84cc16' },
        { min: 13.01, max: 15, label: 'Bien',      color: '#22c55e' },
        { min: 15.01, max: 17, label: 'Très Bien', color: '#14b8a6' },
        { min: 17.01, max: 20, label: 'Excellent', color: '#6366f1' },
      ];
      for (const b of defaultBaremes) {
        await db.query(
          `INSERT INTO baremes_appreciation (etablissement_id, note_min, note_max, appreciation, couleur)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (etablissement_id, note_min, note_max) DO NOTHING`,
          [etab.id, b.min, b.max, b.label, b.color]
        );
      }
      console.log(`Barèmes par défaut injectés pour l'établissement: ${etab.id}`);
    }

    console.log('Migration terminée avec succès.');
  } catch (err) {
    console.error('Erreur migration:', err);
  }
  process.exit();
}

migrate();
