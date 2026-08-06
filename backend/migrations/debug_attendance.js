const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const db = require('../src/config/db');

async function debugAttendance() {
  // Get first professor
  const { rows: profs } = await db.query(`SELECT id, nom, prenom FROM professeurs LIMIT 3`);
  console.log('Professeurs:', profs);

  if (profs.length === 0) { console.log('Aucun professeur trouvé'); process.exit(); }

  const profId = profs[0].id;
  console.log('\nChecking getTeacherClasses for prof:', profId);

  // Simulate getTeacherClasses query
  const { rows: classes } = await db.query(`
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
    ORDER BY etablissement_nom ASC, classe_nom ASC, matiere_nom ASC
  `, [profId]);

  console.log('Classes retournées:', classes);

  // Check absences table columns
  const { rows: cols } = await db.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'absences'
    ORDER BY ordinal_position
  `);
  console.log('\nColonnes de la table absences:', cols.map(c => c.column_name));

  process.exit();
}

debugAttendance().catch(e => { console.error(e); process.exit(1); });
