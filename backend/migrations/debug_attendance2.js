const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const db = require('../src/config/db');

async function debugAttendance2() {
  // Prof Diop Saliou
  const profId = '9c7a6c37-fbb5-4ad9-81f3-2b39bb462322';
  const classeId = '9b9dad60-3043-4ea0-9e01-0cea10a08e87';
  const matiereId = 'e71e931a-7430-4bbe-8c6c-f7a528328510';

  // Check if prof is affiliated
  const { rows: affil } = await db.query(
    `SELECT * FROM professeurs_etablissements WHERE professeur_id = $1`,
    [profId]
  );
  console.log('Affiliations:', affil);

  // Check professeur_matieres
  const { rows: pm } = await db.query(
    `SELECT * FROM professeur_matieres WHERE professeur_id = $1`,
    [profId]
  );
  console.log('professeur_matieres:', pm);

  // Check if classe exists and has correct etablissement_id
  const { rows: classe } = await db.query(
    `SELECT id, nom, etablissement_id FROM classes WHERE id = $1`,
    [classeId]
  );
  console.log('Classe:', classe);

  // Check emplois_du_temps for this prof
  const { rows: edt } = await db.query(
    `SELECT * FROM emplois_du_temps WHERE professeur_id = $1 LIMIT 5`,
    [profId]
  );
  console.log('Emplois du temps:', edt);

  // Try to insert a test absence to check for errors
  try {
    const { rows: students } = await db.query(
      `SELECT id FROM eleves JOIN inscription_classes ic ON id = ic.eleve_id WHERE ic.classe_id = $1 LIMIT 1`,
      [classeId]
    );
    console.log('Premier élève:', students);

    if (students.length > 0) {
      const eleveId = students[0].id;
      // Simulate INSERT
      await db.query(
        `INSERT INTO absences (eleve_id, date_absence, justifiee, type_presence, duree_retard, matiere_id, classe_id, professeur_id, motif)
         VALUES ($1, $2, FALSE, $3, $4, $5, $6, $7, $8)`,
        [eleveId, '2026-07-16', 'ABSENCE', 0, matiereId, classeId, profId, 'Test']
      );
      console.log('✅ INSERT réussi !');
      // Rollback test
      await db.query(`DELETE FROM absences WHERE motif = 'Test' AND professeur_id = $1`, [profId]);
      console.log('Nettoyage effectué.');
    }
  } catch (err) {
    console.error('❌ Erreur INSERT:', err.message);
    console.error('Code:', err.code);
    console.error('Detail:', err.detail);
  }

  process.exit();
}

debugAttendance2().catch(e => { console.error(e); process.exit(1); });
