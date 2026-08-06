const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

async function fixConstraint() {
  try {
    console.log("Suppression de l'ancienne contrainte...");
    await pool.query("ALTER TABLE notes DROP CONSTRAINT IF EXISTS unique_note_per_period");
    
    console.log("Ajout de la nouvelle contrainte incluant le type de note...");
    // On inclut eleve_id, matiere_id, semestre, type_note et trimestre (même si trimestre est souvent null)
    await pool.query(`
      ALTER TABLE notes 
      ADD CONSTRAINT unique_note_per_type 
      UNIQUE (eleve_id, matiere_id, semestre, type_note, trimestre)
    `);
    
    console.log("Contrainte mise à jour avec succès !");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fixConstraint();
