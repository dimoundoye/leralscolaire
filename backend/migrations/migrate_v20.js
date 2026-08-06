const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const db = require('../src/config/db');

async function migrate() {
  try {
    console.log('--- Migration v20: Adding classe_id to notes table & backfilling ---');
    
    // 1. Add column if not exists
    await db.query(`ALTER TABLE notes ADD COLUMN IF NOT EXISTS classe_id UUID REFERENCES classes(id) ON DELETE SET NULL`);

    // 2. Update existing notes matching date_saisie and annee_scolaire
    const res1 = await db.query(`
      UPDATE notes n
      SET classe_id = (
        SELECT ic.classe_id 
        FROM inscription_classes ic 
        JOIN classes c ON ic.classe_id = c.id 
        WHERE ic.eleve_id = n.eleve_id 
          AND (
            (c.annee_scolaire = '2025-2026' AND (n.date_saisie IS NULL OR n.date_saisie < '2026-08-01'))
            OR
            (c.annee_scolaire = '2026-2027' AND n.date_saisie >= '2026-08-01')
          )
        LIMIT 1
      )
      WHERE n.classe_id IS NULL
    `);
    console.log(`Updated ${res1.rowCount} notes with matching class.`);

    // 3. Fallback for any remaining unlinked notes
    const res2 = await db.query(`
      UPDATE notes n
      SET classe_id = (
        SELECT ic.classe_id 
        FROM inscription_classes ic 
        WHERE ic.eleve_id = n.eleve_id 
        LIMIT 1
      )
      WHERE n.classe_id IS NULL
    `);
    console.log(`Fallback updated ${res2.rowCount} remaining notes.`);

    console.log('Migration v20 completed successfully.');
  } catch (err) {
    console.error('Migration v20 error:', err);
  } finally {
    process.exit();
  }
}

migrate();
