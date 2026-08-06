const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

async function initDb() {
  try {
    console.log('Connexion à la base de données...');
    const sql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
    
    await pool.query(sql);
    console.log('✅ Tables créées avec succès !');
    
    // Ajout de quelques données de test (optionnel)
    console.log('Insertion des matières de base...');
    await pool.query(`
      INSERT INTO matieres (nom, code_matiere) VALUES 
      ('Mathématiques', 'MATH'),
      ('Français', 'FR'),
      ('Sciences de la Vie et de la Terre', 'SVT'),
      ('Physique-Chimie', 'PC'),
      ('Histoire-Géographie', 'HG'),
      ('Anglais', 'ANG')
      ON CONFLICT (code_matiere) DO NOTHING;
    `);
    console.log('✅ Matières initialisées !');

  } catch (err) {
    console.error('❌ Erreur lors de l\'initialisation :', err);
  } finally {
    await pool.end();
  }
}

initDb();
