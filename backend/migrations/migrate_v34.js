require('dotenv').config();
const db = require('../src/config/db');

async function migrate() {
  try {
    console.log('🚀 Migration v34 : Ajout et synchronisation de identifiant_national sur la table users...');

    // 1. Ajouter la colonne identifiant_national si elle n'existe pas
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS identifiant_national VARCHAR(100),
      ADD COLUMN IF NOT EXISTS password_provisoire VARCHAR(100);
    `);
    console.log('  ✓ Colonnes identifiant_national et password_provisoire assurées sur la table users');

    // 2. Créer l'index pour des recherches rapides à la connexion
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_users_identifiant_national ON users(identifiant_national);
    `);
    console.log('  ✓ Index idx_users_identifiant_national créé');

    // 3. Synchroniser les identifiants nationaux des élèves déjà existants
    const syncEleves = await db.query(`
      UPDATE users u
      SET identifiant_national = e.identifiant_national
      FROM eleves e
      WHERE e.user_id = u.id AND (u.identifiant_national IS NULL OR u.identifiant_national = '')
      RETURNING u.id;
    `);
    console.log(`  ✓ ${syncEleves.rowCount || 0} compte(s) élève(s) synchronisé(s) avec leur identifiant national`);

    // 4. Synchroniser le compte Office du BAC si nécessaire
    await db.query(`
      UPDATE users
      SET identifiant_national = 'OFFICE-BAC-SN'
      WHERE role = 'OFFICE_BAC' AND (identifiant_national IS NULL OR identifiant_national = '');
    `);
    console.log('  ✓ Compte Office du BAC synchronisé');

    console.log('✅ Migration v34 exécutée avec succès !');
  } catch (err) {
    console.error('❌ Erreur migration v34:', err);
  } finally {
    process.exit();
  }
}

migrate();
