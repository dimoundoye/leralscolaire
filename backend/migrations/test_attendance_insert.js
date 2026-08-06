const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const db = require('../src/config/db');

async function testInsert() {
  const profId = '9c7a6c37-fbb5-4ad9-81f3-2b39bb462322';
  const classeId = '9b9dad60-3043-4ea0-9e01-0cea10a08e87';
  const matiereId = 'e71e931a-7430-4bbe-8c6c-f7a528328510';

  // Get a real student ID properly
  const { rows: students } = await db.query(
    `SELECT e.id FROM eleves e JOIN inscription_classes ic ON e.id = ic.eleve_id WHERE ic.classe_id = $1 LIMIT 1`,
    [classeId]
  );
  console.log('Élèves:', students);

  if (students.length === 0) {
    console.log('Aucun élève dans cette classe');
    process.exit();
  }

  const eleveId = students[0].id;

  // Test DELETE first
  try {
    await db.query(
      `DELETE FROM absences WHERE classe_id = $1 AND matiere_id = $2 AND date_absence = $3 AND professeur_id = $4`,
      [classeId, matiereId, '2026-07-16', profId]
    );
    console.log('✅ DELETE réussi');
  } catch (err) {
    console.error('❌ DELETE error:', err.message);
  }

  // Test INSERT 
  try {
    await db.query(
      `INSERT INTO absences (eleve_id, date_absence, justifiee, type_presence, duree_retard, matiere_id, classe_id, professeur_id, motif)
       VALUES ($1, $2, FALSE, $3, $4, $5, $6, $7, $8)`,
      [eleveId, '2026-07-16', 'ABSENCE', 0, matiereId, classeId, profId, null]
    );
    console.log('✅ INSERT réussi !');
    // cleanup
    await db.query(`DELETE FROM absences WHERE classe_id = $1 AND professeur_id = $2 AND date_absence = $3`, [classeId, profId, '2026-07-16']);
    console.log('Nettoyage OK');
  } catch (err) {
    console.error('❌ INSERT error:', err.message);
    console.error('Code:', err.code);
    console.error('Detail:', err.detail);
    console.error('Constraint:', err.constraint);
  }

  // Now let's simulate the full saveAttendance flow
  console.log('\n--- Simulation du flow saveAttendance ---');
  const classes = await (async () => {
    const { rows } = await db.query(`
      SELECT DISTINCT classe_id, matiere_id, classe_nom, niveau, matiere_nom, etablissement_nom, etablissement_id
      FROM (
        SELECT pm.classe_id, pm.matiere_id, c.nom as classe_nom, c.niveau, m.nom as matiere_nom, et.nom as etablissement_nom, et.id as etablissement_id
        FROM professeur_matieres pm
        JOIN classes c ON pm.classe_id = c.id
        JOIN matieres m ON pm.matiere_id = m.id
        JOIN etablissements et ON c.etablissement_id = et.id
        JOIN professeurs_etablissements pe ON pe.etablissement_id = et.id AND pe.professeur_id = pm.professeur_id
        WHERE pm.professeur_id = $1 AND pe.statut = 'ACCEPTE'
        UNION
        SELECT edt.classe_id, edt.matiere_id, c.nom as classe_nom, c.niveau, m.nom as matiere_nom, et.nom as etablissement_nom, et.id as etablissement_id
        FROM emplois_du_temps edt
        JOIN classes c ON edt.classe_id = c.id
        JOIN matieres m ON edt.matiere_id = m.id
        JOIN etablissements et ON c.etablissement_id = et.id
        JOIN professeurs_etablissements pe ON pe.etablissement_id = et.id AND pe.professeur_id = edt.professeur_id
        WHERE edt.professeur_id = $1 AND pe.statut = 'ACCEPTE'
      ) AS combined
    `, [profId]);
    return rows;
  })();

  const isAssigned = classes.some(c => c.classe_id === classeId && c.matiere_id === matiereId);
  console.log('isAssigned check:', isAssigned);
  console.log('classeId type:', typeof classeId, classeId);
  console.log('matiereId type:', typeof matiereId, matiereId);
  console.log('classes[0].classe_id type:', typeof classes[0]?.classe_id, classes[0]?.classe_id);
  console.log('classes[0].matiere_id type:', typeof classes[0]?.matiere_id, classes[0]?.matiere_id);

  process.exit();
}

testInsert().catch(e => { console.error(e); process.exit(1); });
