require('dotenv').config();
const db = require('../src/config/db');

// Migration v41 : compteur d'essais sur les codes de réinitialisation de mot de passe
// (le code est invalidé après 5 essais erronés, contre le cassage par force brute).
async function migrate() {
  try {
    console.log('🚀 Migration v41 : compteur de tentatives sur password_resets...');
    await db.query(`
      ALTER TABLE password_resets ADD COLUMN IF NOT EXISTS tentatives INT NOT NULL DEFAULT 0;
    `);
    console.log('✅ Migration v41 exécutée avec succès !');
  } catch (err) {
    console.error('❌ Erreur migration v41:', err);
  } finally {
    process.exit();
  }
}

migrate();
