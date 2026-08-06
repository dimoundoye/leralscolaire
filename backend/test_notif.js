require('dotenv').config();
const db = require('./src/config/db');

async function test() {
  try {
    const pubRes = await db.query(`
      SELECT r.eleve_id, r.numero_table, r.moyenne, r.statut_deliberation, r.mention, e.user_id
      FROM resultats_examens_nationaux r
      JOIN eleves e ON r.eleve_id = e.id
      WHERE LOWER(r.jury) = 'jury 001' OR r.jury IS NULL
    `);
    console.log('CANDIDATES FOUND:', pubRes.rows.length);

    for (const c of pubRes.rows) {
      if (c.user_id) {
        const res = await db.query(
          `INSERT INTO notifications (user_id, titre, description, type, lu, created_at)
           VALUES ($1, $2, $3, $4, FALSE, NOW()) RETURNING *`,
          [c.user_id, 'Résultats Officiels Publiés !', 'Notification de test de délibération', 'DELIBERATION']
        );
        console.log('SUCCESS FOR USER:', c.user_id, res.rows[0].id);
      } else {
        console.log('NO USER_ID FOR ELEVE:', c.eleve_id);
      }
    }
  } catch (err) {
    console.error('FAIL:', err);
  }
}

test();
