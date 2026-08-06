require('dotenv').config();
const db = require('../config/db');

async function updatePdf() {
  try {
    const res = await db.query(
      `UPDATE messages SET fichier_url = $1, fichier_nom = $2 WHERE sujet LIKE '%CONVOCATION%'`,
      ['/uploads/messages/Convocation_Officielle_Jury_1002_1785503275199.pdf', 'Convocation_Officielle_Jury_1002.pdf']
    );
    console.log('Mis à jour avec succès, lignes modifiées:', res.rowCount);
  } catch (err) {
    console.error('Erreur update:', err);
  } finally {
    process.exit(0);
  }
}

updatePdf();
