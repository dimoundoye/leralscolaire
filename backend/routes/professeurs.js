const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// --- LISTER LES PROFESSEURS DE L'ETABLISSEMENT ---
router.get('/', auth, async (req, res) => {
  try {
    const etablissementRes = await db.query(
      'SELECT id FROM etablissements WHERE admin_id = $1',
      [req.user.id]
    );
    if (etablissementRes.rows.length === 0) return res.status(404).json({ message: 'Établissement non trouvé.' });
    const etablissementId = etablissementRes.rows[0].id;

    const profsRes = await db.query(`
      SELECT u.id, u.email, u.created_at
      FROM users u
      JOIN professeurs_etablissements pe ON u.id = pe.professeur_id
      WHERE pe.etablissement_id = $1 AND u.role = 'PROFESSEUR'
      ORDER BY u.email ASC
    `, [etablissementId]);

    res.json(profsRes.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération des professeurs.' });
  }
});

// --- CRÉER UN COMPTE PROFESSEUR ---
router.post('/', auth, async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Trouver l'établissement
    const etablissementRes = await db.query(
      'SELECT id FROM etablissements WHERE admin_id = $1',
      [req.user.id]
    );
    if (etablissementRes.rows.length === 0) return res.status(404).json({ message: 'Seul l\'admin peut créer un prof.' });
    const etablissementId = etablissementRes.rows[0].id;

    // 2. Vérifier si l'utilisateur existe déjà
    const userExists = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) return res.status(400).json({ message: 'Cet email est déjà utilisé.' });

    // 3. Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password || 'prof-2025', salt);

    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // Créer l'utilisateur
      const userRes = await client.query(
        'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id',
        [email, passwordHash, 'PROFESSEUR']
      );
      const profId = userRes.rows[0].id;

      // Lier à l'établissement
      await client.query(
        'INSERT INTO professeurs_etablissements (professeur_id, etablissement_id) VALUES ($1, $2)',
        [profId, etablissementId]
      );

      await client.query('COMMIT');
      res.status(201).json({ message: 'Professeur créé avec succès !', id: profId });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la création du professeur.' });
  }
});

module.exports = router;
