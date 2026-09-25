const express = require('express');
const router = express.Router();
const juryBacController = require('../controllers/juryBacController');
const db = require('../config/db');
const auth = require('../middleware/authMiddleware');

// Middleware vérifiant l'accès Jury (Professeur désigné ou Office du BAC)
const checkJuryAccess = async (req, res, next) => {
  if (req.user.role === 'OFFICE_BAC' || req.user.role === 'SUPER_ADMIN') {
    return next();
  }

  try {
    let checkRes;
    if (req.user.jury_id) {
      checkRes = await db.query("SELECT * FROM jurys_bac WHERE id = $1 AND statut = 'ACTIF'", [req.user.jury_id]);
    } else {
      checkRes = await db.query(
        `
        SELECT * FROM jurys_bac
        WHERE president_prof_id = $1 AND statut = 'ACTIF'
      `,
        [req.user.id]
      );
    }

    if (checkRes.rows.length === 0) {
      return res.status(403).json({ message: 'Accès réservé aux Présidents de Jury du BAC désignés.' });
    }

    const juryInfo = checkRes.rows[0];

    // Vérifier l'expiration des accès si définie
    if (juryInfo.date_expiration_acces && new Date() > new Date(juryInfo.date_expiration_acces)) {
      return res.status(403).json({ message: 'Vos accès temporaires de Président de Jury ont expiré.' });
    }

    req.juryInfo = juryInfo;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur vérification droits Jury.' });
  }
};

// ─────────────────────────────────────────────
// 1. INFOS DU JURY ASSIGNÉ AU PRÉSIDENT CONNECTÉ
// ─────────────────────────────────────────────
router.get('/my-jury', auth, checkJuryAccess, juryBacController.getMyJury);

// ─────────────────────────────────────────────
// 2. LISTE DES CANDIDATS DU JURY ET MOYENNES
// ─────────────────────────────────────────────
router.get('/candidats', auth, checkJuryAccess, juryBacController.listCandidats);

// ─────────────────────────────────────────────
// 3. SAISIE & CALCUL AUTOMATIQUE DES NOTES PAR ÉPREUVE
// ─────────────────────────────────────────────

// Obtenir la grille de notes d'un candidat
router.get('/candidats/:id/notes', auth, checkJuryAccess, juryBacController.getCandidatNotes);

// Enregistrer les notes, appréciation et calculer automatiquement la moyenne & admissibilité
router.post('/candidats/:id/notes', auth, checkJuryAccess, juryBacController.saveCandidatNotes);

// ─────────────────────────────────────────────
// 4. DÉCISION DE REPÊCHAGE DU JURY (SUR LIVRET)
// ─────────────────────────────────────────────
router.post('/candidats/:id/repecher', auth, checkJuryAccess, juryBacController.repecherCandidat);

// ─────────────────────────────────────────────
// 5. CLÔTURE DÉFINITIVE & SIGNATURE DU PV DE JURY
// ─────────────────────────────────────────────
router.put('/verrouiller', auth, checkJuryAccess, juryBacController.verrouillerJury);

// ─────────────────────────────────────────────
// 6. PUBLICATION DIRECTE DES RÉSULTATS & NOTIFICATION ÉLÈVES
// ─────────────────────────────────────────────
router.put('/publier', auth, checkJuryAccess, juryBacController.publierResultatsJury);

module.exports = router;
