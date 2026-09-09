const { Pool } = require('pg');
require('dotenv').config({ path: __dirname + '/../.env' });

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

async function cleanDatabase() {
  const client = await pool.connect();
  try {
    console.log('🧹 Démarrage du nettoyage complet de la base de données...');
    await client.query('BEGIN');

    // Liste des tables opérationnelles et transactionnelles à vider
    const tablesToTruncate = [
      'absences',
      'bulletins',
      'bulletins_autorises',
      'bulletins_telechargements',
      'cahier_de_texte',
      'campagnes_evaluation_eleves',
      'centres_examen_bac',
      'classe_matieres',
      'demandes_attestation',
      'demandes_inscription_office',
      'documents_partages',
      'emargements',
      'emplois_du_temps',
      'evaluations_eleves',
      'examens_planification',
      'historique_notes',
      'inscription_classes',
      'jurys_bac',
      'livrets_scolaires_bac',
      'messages',
      'notes',
      'notes_candidats_bac',
      'notifications',
      'portfolio_items',
      'pre_inscriptions',
      'professeur_matieres',
      'professeurs_etablissements',
      'professeurs',
      'regles_passage',
      'resultats_examens_nationaux',
      'seances_cours',
      'signalements_discipline',
      'transferts_eleves',
      'eleves',
      'classes',
      'etablissements'
    ];

    for (const table of tablesToTruncate) {
      try {
        await client.query(`TRUNCATE TABLE ${table} CASCADE;`);
        console.log(`  ✓ Table ${table} vidée.`);
      } catch (err) {
        console.warn(`  ⚠️ Impossible de vider ${table} : ${err.message}`);
      }
    }

    // Supprimer tous les utilisateurs SAUF le compte Office du Bac
    const userDeleteRes = await client.query(`
      DELETE FROM users 
      WHERE role != 'OFFICE_BAC';
    `);
    console.log(`  ✓ ${userDeleteRes.rowCount} utilisateur(s) supprimé(s).`);

    // Vérifier les utilisateurs restants
    const remainingUsers = await client.query('SELECT id, email, role, identifiant_national FROM users;');
    console.log('\nComptes restants en base :');
    console.log(remainingUsers.rows);

    await client.query('COMMIT');
    console.log('\n🎉 Base de données réinitialisée avec succès ! Seul le compte OFFICE_BAC est conservé.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erreur lors du nettoyage :', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

cleanDatabase();
