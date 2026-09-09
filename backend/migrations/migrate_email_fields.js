const { Pool } = require('pg');
require('dotenv').config({ path: __dirname + '/../.env' });

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('🚀 Démarrage de la migration des champs email...');
    await client.query('BEGIN');

    // 1. Ajouter email dans eleves
    await client.query(`
      ALTER TABLE eleves 
      ADD COLUMN IF NOT EXISTS email VARCHAR(255);
    `);
    console.log('✅ Colonne "email" ajoutée ou vérifiée dans la table "eleves".');

    // 2. Ajouter email dans pre_inscriptions
    await client.query(`
      ALTER TABLE pre_inscriptions 
      ADD COLUMN IF NOT EXISTS email VARCHAR(255);
    `);
    console.log('✅ Colonne "email" ajoutée ou vérifiée dans la table "pre_inscriptions".');

    // 3. Ajouter email_professionnel dans etablissements
    await client.query(`
      ALTER TABLE etablissements 
      ADD COLUMN IF NOT EXISTS email_professionnel VARCHAR(255);
    `);
    console.log('✅ Colonne "email_professionnel" ajoutée ou vérifiée dans la table "etablissements".');

    await client.query('COMMIT');
    console.log('🎉 Migration complétée avec succès !');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erreur lors de la migration :', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
