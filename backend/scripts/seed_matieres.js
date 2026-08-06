const db = require('./db');

async function seed() {
  const matieres = [
    {nom: 'Mathématiques', code: 'MATH'},
    {nom: 'Français', code: 'FRA'},
    {nom: 'SVT', code: 'SVT'},
    {nom: 'Physique-Chimie', code: 'PC'},
    {nom: 'Histoire-Géo', code: 'HG'},
    {nom: 'Anglais', code: 'ANG'},
    {nom: 'EPS', code: 'EPS'},
    {nom: 'Philosophie', code: 'PHIL'}
  ];

  try {
    for (const m of matieres) {
      await db.query(
        'INSERT INTO matieres (nom, code_matiere) VALUES ($1, $2) ON CONFLICT (code_matiere) DO NOTHING',
        [m.nom, m.code]
      );
    }
    console.log('✅ Matières initialisées avec succès !');
  } catch (err) {
    console.error('❌ Erreur seed:', err);
  } finally {
    process.exit();
  }
}

seed();
