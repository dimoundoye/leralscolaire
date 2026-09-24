const express = require('express');
const router = express.Router();
const EmargementController = require('../controllers/emargementController');
const authenticateToken = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/access');

// 1. Borne QR Code Live 20s (Accès public ou surveillant)
router.get('/live-qr/:etablissementId', EmargementController.getLiveQrToken);

// 2. Émargement Professeur (QR Code 20s)
router.post('/scan', authenticateToken, EmargementController.scanEmargement);

// 3. Émargement Terrain EPS (GPS Stadium <100m)
router.post('/eps-terrain', authenticateToken, EmargementController.emargerEpsTerrain);

// 4. Cahier de Texte complet (Validation 100%)
router.post('/cahier-texte-complete', authenticateToken, EmargementController.completeCahierTexte);

// 5. Demande & Validation de Rattrapage
router.post('/rattrapage/demande', authenticateToken, EmargementController.requestRattrapage);
router.post('/rattrapage/approuver', authenticateToken, requireRole('ADMIN_ETABLISSEMENT'), EmargementController.approveRattrapage);

// 6. Évaluation Élève anonyme 5 questions
router.post('/evaluation-eleve', authenticateToken, requireRole('ELEVE'), EmargementController.submitStudentEvaluation);

// 7. Recherche & Fiche d'Identité Enseignant (Office du BAC)
router.get('/office/search', authenticateToken, requireRole('OFFICE_BAC'), EmargementController.searchProfesseursOfficeBac);
router.get('/office/carte-identite/:profId', authenticateToken, requireRole('OFFICE_BAC'), EmargementController.getProfCarteIdentiteOfficeBac);

// 8. Statistiques et séances du professeur connecté
router.get('/my-stats', authenticateToken, EmargementController.getMyStats);

module.exports = router;
