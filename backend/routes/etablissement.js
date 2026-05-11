const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// --- RÉCUPÉRER LES INFOS DE L'ÉTABLISSEMENT ---
router.get('/profile', auth, async (req, res) => {
  try {
    const etablissementRes = await db.query(
      'SELECT * FROM etablissements WHERE admin_id = $1',
      [req.user.id]
    );
    if (etablissementRes.rows.length === 0) return res.status(404).json({ message: 'Établissement non trouvé.' });
    res.json(etablissementRes.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération du profil.' });
  }
});

// --- METTRE À JOUR LES INFOS DE L'ÉTABLISSEMENT ---
router.put('/profile', auth, async (req, res) => {
  const { nom, region, ville, code_etablissement } = req.body;

  try {
    const etablissementRes = await db.query(
      'UPDATE etablissements SET nom = $1, region = $2, ville = $3, code_etablissement = $4 WHERE admin_id = $5 RETURNING *',
      [nom, region, ville, code_etablissement, req.user.id]
    );
    if (etablissementRes.rows.length === 0) return res.status(404).json({ message: 'Établissement non trouvé.' });
    res.json(etablissementRes.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du profil.' });
  }
});

module.exports = router;
