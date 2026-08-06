const db = require('./db');

async function migrate() {
  try {
    console.log('--- Démarrage de la migration v11 ---');

    // Ajouter la colonne heures_absent
    await db.query(`
      ALTER TABLE absences 
      ADD COLUMN IF NOT EXISTS heures_absent INTEGER DEFAULT 1;
    `);
    console.log('✅ Colonne heures_absent ajoutée à la table absences');

    // Seeder des données d'absences pour les élèves
    const elevesRes = await db.query('SELECT id FROM eleves LIMIT 5');
    if (elevesRes.rows.length > 0) {
      console.log('Seeding des absences d\'exemple pour le calendrier...');
      for (const eleve of elevesRes.rows) {
        // Supprimer les absences existantes de l'élève de test pour avoir un set propre
        await db.query('DELETE FROM absences WHERE eleve_id = $1', [eleve.id]);

        const dates = [
          { date: '2026-06-15', hrs: 2, just: false },
          { date: '2026-06-16', hrs: 4, just: true },
          { date: '2026-06-25', hrs: 1, just: false },
          { date: '2026-05-10', hrs: 1, just: false },
          { date: '2026-05-11', hrs: 6, just: false },
          { date: '2026-05-20', hrs: 3, just: true },
          { date: '2026-04-12', hrs: 2, just: false },
          { date: '2026-04-20', hrs: 8, just: true },
          { date: '2026-04-22', hrs: 3, just: false },
          { date: '2026-03-05', hrs: 1, just: true },
          { date: '2026-03-14', hrs: 4, just: false },
          { date: '2026-02-18', hrs: 5, just: false },
          { date: '2025-11-12', hrs: 7, just: false },
          { date: '2025-11-13', hrs: 2, just: true },
          { date: '2025-10-05', hrs: 1, just: false },
          { date: '2025-10-06', hrs: 3, just: false },
          { date: '2025-07-02', hrs: 4, just: false }
        ];

        for (const d of dates) {
          await db.query(`
            INSERT INTO absences (eleve_id, date_absence, justifiee, points_deduits, heures_absent)
            VALUES ($1, $2, $3, 0, $4)
          `, [eleve.id, d.date, d.just, d.hrs]);
        }
      }
      console.log('✅ Seeding des absences terminé');
    }

    console.log('--- Migration v11 terminée ---');
  } catch (err) {
    console.error('❌ Erreur de migration v11:', err);
  }
  process.exit();
}

migrate();
