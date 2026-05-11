const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// --- RÉCUPÉRER TOUTES LES MATIÈRES ---
router.get('/matieres', auth, async (req, res) => {
  try {
    const matieresRes = await db.query('SELECT * FROM matieres ORDER BY nom');
    res.json(matieresRes.rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération des matières.' });
  }
});

// --- RÉCUPÉRER LES NOTES D'UNE CLASSE POUR UNE MATIÈRE ---
router.get('/classe/:classeId/matiere/:matiereId', auth, async (req, res) => {
  const { classeId, matiereId } = req.params;
  try {
    const notesRes = await db.query(`
      SELECT e.id as eleve_id, e.nom, e.prenom, n.valeur as note, n.appreciation, n.id as note_id
      FROM eleves e
      JOIN inscription_classes ic ON e.id = ic.eleve_id
      LEFT JOIN notes n ON e.id = n.eleve_id AND n.matiere_id = $2
      WHERE ic.classe_id = $1
      ORDER BY e.nom, e.prenom
    `, [classeId, matiereId]);
    
    res.json(notesRes.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// --- ENREGISTRER OU METTRE À JOUR LES NOTES AVEC HISTORIQUE ---
router.post('/batch', auth, async (req, res) => {
  const { notes, matiere_id, semestre, trimestre, type_note } = req.body; 

  try {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      for (const item of notes) {
        if (item.valeur === '' || item.valeur === null) continue;

        // 1. Récupérer l'ancienne valeur pour l'historique
        const oldNoteRes = await client.query(`
          SELECT id, valeur, appreciation FROM notes 
          WHERE eleve_id = $1 AND matiere_id = $2 AND semestre = $3 AND trimestre = $4 AND type_note = $5
        `, [item.eleve_id, matiere_id, semestre || 1, trimestre || 1, type_note || 'DEVOIR']);

        let noteId;
        if (oldNoteRes.rows.length > 0) {
          const old = oldNoteRes.rows[0];
          noteId = old.id;

          // Si la valeur a changé, on logge dans l'historique
          if (parseFloat(old.valeur) !== parseFloat(item.valeur) || old.appreciation !== item.appreciation) {
            await client.query(`
              INSERT INTO historique_notes (note_id, ancienne_valeur, nouvelle_valeur, ancienne_appreciation, nouvelle_appreciation, auteur_id)
              VALUES ($1, $2, $3, $4, $5, $6)
            `, [noteId, old.valeur, item.valeur, old.appreciation, item.appreciation, req.user.id]);

            await client.query(`
              UPDATE notes SET valeur = $1, appreciation = $2, updated_at = NOW()
              WHERE id = $3
            `, [item.valeur, item.appreciation, noteId]);
          }
        } else {
          // Nouvelle note
          const newNoteRes = await client.query(`
            INSERT INTO notes (eleve_id, matiere_id, valeur, appreciation, semestre, trimestre, type_note, professeur_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id
          `, [item.eleve_id, matiere_id, item.valeur, item.appreciation, semestre || 1, trimestre || 1, type_note || 'DEVOIR', req.user.id]);
          noteId = newNoteRes.rows[0].id;
        }
      }

      await client.query('COMMIT');
      res.json({ message: 'Notes enregistrées avec succès !' });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de l\'enregistrement des notes.' });
  }
});

// --- CALCUL DES MOYENNES D'UNE CLASSE ---
router.get('/moyennes/:classeId', auth, async (req, res) => {
  const { classeId } = req.params;
  const { semestre, trimestre } = req.query;

  try {
    const moyennesRes = await db.query(`
      SELECT 
        e.id as eleve_id, e.nom, e.prenom,
        SUM(n.valeur * cm.coefficient) / SUM(cm.coefficient) as moyenne_generale,
        COUNT(a.id) as total_absences,
        SUM(a.points_deduits) as total_points_perdus
      FROM eleves e
      JOIN inscription_classes ic ON e.id = ic.eleve_id
      JOIN classe_matieres cm ON ic.classe_id = cm.classe_id
      LEFT JOIN notes n ON e.id = n.eleve_id AND n.matiere_id = cm.matiere_id
      LEFT JOIN absences a ON e.id = a.eleve_id AND a.date_absence BETWEEN '2025-01-01' AND '2025-12-31'
      WHERE ic.classe_id = $1
      AND (n.semestre = $2 OR $2 IS NULL)
      GROUP BY e.id, e.nom, e.prenom
    `, [classeId, semestre]);

    // Appliquer la déduction de points si nécessaire
    const finalResults = moyennesRes.rows.map(row => {
      let moyenne = parseFloat(row.moyenne_generale) || 0;
      // Optionnel: déduire les points d'absence de la moyenne? 
      // L'utilisateur dit "Système optionnel de déduction de points pour absence"
      // On va supposer que ça réduit la moyenne ou le total.
      return {
        ...row,
        moyenne_finale: Math.max(0, moyenne - (row.total_points_perdus / 10)) // Exemple: 10 points perdus = -1 sur la moyenne
      };
    });

    res.json(finalResults);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors du calcul des moyennes.' });
  }
});

module.exports = router;

