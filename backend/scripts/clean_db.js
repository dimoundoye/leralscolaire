const db = require('../src/config/db');
const bcrypt = require('bcryptjs');

async function cleanDatabase() {
  const client = await db.pool.connect();
  try {
    console.log('🧹 Démarrage de la réinitialisation de la base de données...');
    console.log('🔒 Protection active : Seul le compte OFFICE_BAC sera conservé.\n');

    await client.query('BEGIN');

    // 1. Récupération dynamique de toutes les tables publiques
    const tablesRes = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
        AND tablename NOT IN ('users', 'matieres', 'office_bac_settings')
      ORDER BY tablename ASC;
    `);

    const tablesToTruncate = tablesRes.rows.map(r => r.tablename);

    console.log(`📋 ${tablesToTruncate.length} table(s) identifiée(s) pour nettoyage :`);
    for (const table of tablesToTruncate) {
      try {
        await client.query(`TRUNCATE TABLE "${table}" CASCADE;`);
        console.log(`  ✓ Table [${table}] vidée.`);
      } catch (err) {
        console.warn(`  ⚠️ Table [${table}] ignorée ou inexistante : ${err.message}`);
      }
    }

    // 2. Suppression de tous les utilisateurs sauf OFFICE_BAC
    const userDeleteRes = await client.query(`
      DELETE FROM users 
      WHERE role != 'OFFICE_BAC';
    `);
    console.log(`\n  ✓ ${userDeleteRes.rowCount || 0} utilisateur(s) (élèves, profs, établissements, etc.) supprimé(s).`);

    // 3. Réinitialiser les séquences auto-incrémentées (ID auto)
    try {
      await client.query(`
        DO $$ 
        DECLARE 
          seq RECORD;
        BEGIN 
          FOR seq IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public') 
          LOOP 
            EXECUTE 'ALTER SEQUENCE ' || quote_ident(seq.sequence_name) || ' RESTART WITH 1;'; 
          END LOOP; 
        END $$;
      `);
      console.log('  ✓ Séquences et compteurs ID réinitialisés à 1.');
    } catch (seqErr) {
      console.warn('  ⚠️ Note sur les séquences :', seqErr.message);
    }

    // 4. Vérifier et assurer la présence du compte OFFICE_BAC
    const officeCheck = await client.query(`
      SELECT id, email, role, identifiant_national 
      FROM users 
      WHERE role = 'OFFICE_BAC';
    `);

    if (officeCheck.rows.length === 0) {
      console.log('  ⚠️ Aucun compte OFFICE_BAC trouvé ! Création automatique du compte officiel...');
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('OfficeBAC@2026', salt);
      await client.query(`
        INSERT INTO users (email, password_hash, role, identifiant_national)
        VALUES ('OFFICE-BAC-SN', $1, 'OFFICE_BAC', 'OFFICE-BAC-SN');
      `, [hash]);
      console.log('  ✓ Compte OFFICE-BAC-SN créé par défaut (Login: OFFICE-BAC-SN / Mdp: OfficeBAC@2026)');
    }

    // 5. Assurer les matières de base si la table est vide
    const matieresCheck = await client.query('SELECT COUNT(*) FROM matieres;');
    if (parseInt(matieresCheck.rows[0].count, 10) === 0) {
      const defaultMatieres = [
        ['Mathématiques', 'MATH'],
        ['Français', 'FRA'],
        ['Sciences de la Vie et de la Terre', 'SVT'],
        ['Physique-Chimie', 'PC'],
        ['Histoire-Géographie', 'HG'],
        ['Anglais', 'ANG'],
        ['Philosophie', 'PHIL'],
        ['Éducation Physique et Sportive', 'EPS']
      ];
      for (const [nom, code] of defaultMatieres) {
        await client.query(
          'INSERT INTO matieres (nom, code_matiere) VALUES ($1, $2) ON CONFLICT (code_matiere) DO NOTHING;',
          [nom, code]
        );
      }
      console.log('  ✓ Matières nationales de base réinitialisées.');
    }

    await client.query('COMMIT');

    // 6. Affichage du bilan final
    const remainingUsers = await client.query(`
      SELECT id, email, role, identifiant_national, created_at 
      FROM users;
    `);

    console.log('\n======================================================');
    console.log('🎉 BASE DE DONNÉES RÉINITIALISÉE AVEC SUCCÈS !');
    console.log('======================================================');
    console.log('Comptes préservés en base :');
    console.table(remainingUsers.rows);
    console.log('======================================================\n');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n❌ Erreur critique lors du nettoyage :', err);
    process.exit(1);
  } finally {
    client.release();
    await db.pool.end();
  }
}

cleanDatabase();
