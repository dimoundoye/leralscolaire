const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// --- ENVOYER UN MESSAGE ---
router.post('/', auth, async (req, res) => {
  const { destinataire_type, destinataire_id, sujet, contenu } = req.body;
  try {
    const result = await db.query(`
      INSERT INTO messages (expediteur_id, destinataire_type, destinataire_id, sujet, contenu)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `, [req.user.id, destinataire_type, destinataire_id, sujet, contenu]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de l\'envoi du message.' });
  }
});

// --- LISTER LES MESSAGES REÇUS ---
router.get('/inbox', auth, async (req, res) => {
  try {
    // Si l'utilisateur est un élève, il reçoit les messages adressés à lui ou à sa classe
    let query = `
      SELECT m.*, u.email as expediteur_nom
      FROM messages m
      JOIN users u ON m.expediteur_id = u.id
      WHERE (m.destinataire_type = 'ELEVE' AND m.destinataire_id = $1)
    `;
    let params = [req.user.id];

    if (req.user.role === 'ELEVE') {
      const eleveRes = await db.query('SELECT id FROM eleves WHERE user_id = $1', [req.user.id]);
      const eleveId = eleveRes.rows[0].id;
      const classeRes = await db.query('SELECT classe_id FROM inscription_classes WHERE eleve_id = $1', [eleveId]);
      
      if (classeRes.rows.length > 0) {
        query += ` OR (m.destinataire_type = 'CLASSE' AND m.destinataire_id = $2)`;
        params.push(classeRes.rows[0].classe_id);
      }
    } else if (req.user.role === 'ADMIN_ETABLISSEMENT') {
        // L'admin reçoit les messages de l'Office du Bac
        query = `SELECT * FROM messages WHERE destinataire_type = 'OFFICE_BAC'`; // Simplifié
        params = [];
    }

    const messages = await db.query(query, params);
    res.json(messages.rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;
