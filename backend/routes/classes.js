const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// --- LISTER LES CLASSES DE L'ETABLISSEMENT ---
router.get('/', auth, async (req, res) => {
  try {
    const etablissementRes = await db.query(
      'SELECT id FROM etablissements WHERE admin_id = $1',
      [req.user.id]
    );
    if (etablissementRes.rows.length === 0) return res.status(404).json({ message: 'Établissement non trouvé.' });
    const etablissementId = etablissementRes.rows[0].id;

    const classesRes = await db.query(
      'SELECT * FROM classes WHERE etablissement_id = $1 ORDER BY niveau, nom',
      [etablissementId]
    );
    res.json(classesRes.rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// --- CRÉER UNE CLASSE ---
router.post('/', auth, async (req, res) => {
  const { nom, niveau, annee_scolaire } = req.body;
  try {
    const etablissementRes = await db.query('SELECT id FROM etablissements WHERE admin_id = $1', [req.user.id]);
    if (etablissementRes.rows.length === 0) return res.status(404).json({ message: 'Admin non trouvé.' });
    const etablissementId = etablissementRes.rows[0].id;

    const newClass = await db.query(
      'INSERT INTO classes (nom, niveau, etablissement_id, annee_scolaire) VALUES ($1, $2, $3, $4) RETURNING *',
      [nom, niveau, etablissementId, annee_scolaire || '2025-2026']
    );
    res.status(201).json(newClass.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la création.' });
  }
});

// --- ASSIGNER DES MATIERES A UNE CLASSE ---
router.post('/:id/matieres', auth, async (req, res) => {
  const { matieres } = req.body; // [{matiere_id, coefficient}]
  const classeId = req.params.id;
  try {
    for (const m of matieres) {
      await db.query(`
        INSERT INTO classe_matieres (classe_id, matiere_id, coefficient)
        VALUES ($1, $2, $3)
        ON CONFLICT (classe_id, matiere_id) DO UPDATE SET coefficient = EXCLUDED.coefficient
      `, [classeId, m.matiere_id, m.coefficient]);
    }
    res.json({ message: 'Matières mises à jour pour cette classe.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de l\'assignation des matières.' });
  }
});

// --- LISTER LES MATIERES D'UNE CLASSE ---
router.get('/:id/matieres', auth, async (req, res) => {
  try {
    const resMatieres = await db.query(`
      SELECT m.*, cm.coefficient
      FROM matieres m
      JOIN classe_matieres cm ON m.id = cm.matiere_id
      WHERE cm.classe_id = $1
    `, [req.params.id]);
    res.json(resMatieres.rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// --- GESTION EMPLOI DU TEMPS ---
router.post('/:id/schedule', auth, async (req, res) => {
  const { matiere_id, professeur_id, jour_semaine, heure_debut, heure_fin, salle } = req.body;
  try {
    await db.query(`
      INSERT INTO emplois_du_temps (classe_id, matiere_id, professeur_id, jour_semaine, heure_debut, heure_fin, salle)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [req.params.id, matiere_id, professeur_id, jour_semaine, heure_debut, heure_fin, salle]);
    res.status(201).json({ message: 'Emploi du temps mis à jour.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la planification.' });
  }
});

router.get('/:id/schedule', auth, async (req, res) => {
  try {
    const resSched = await db.query(`
      SELECT edt.*, m.nom as matiere_nom, u.email as professeur_nom
      FROM emplois_du_temps edt
      JOIN matieres m ON edt.matiere_id = m.id
      JOIN users u ON edt.professeur_id = u.id
      WHERE edt.classe_id = $1
      ORDER BY jour_semaine, heure_debut
    `, [req.params.id]);
    res.json(resSched.rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// --- PLANIFICATION EXAMENS ---
router.post('/:id/exams', auth, async (req, res) => {
  const { matiere_id, type_examen, date_examen, salle } = req.body;
  try {
    const etablissementRes = await db.query('SELECT etablissement_id FROM classes WHERE id = $1', [req.params.id]);
    const etablissementId = etablissementRes.rows[0].etablissement_id;

    await db.query(`
      INSERT INTO examens_planification (etablissement_id, classe_id, matiere_id, type_examen, date_examen, salle)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [etablissementId, req.params.id, matiere_id, type_examen, date_examen, salle]);
    res.status(201).json({ message: 'Examen planifié.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la planification de l\'examen.' });
  }
});

module.exports = router;

