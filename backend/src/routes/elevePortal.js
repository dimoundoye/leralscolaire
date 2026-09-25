const express = require('express');
const router = express.Router();
const elevePortalController = require('../controllers/elevePortalController');

const auth = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/access');

// Security middleware to ensure role is ELEVE
const checkEleveRole = requireRole('ELEVE');

// --- 1. PROFIL DE L'ÉLÈVE ---
router.get('/profile', auth, checkEleveRole, elevePortalController.getProfile);

// --- 2. MODIFIER LES COORDONNÉES DU PROFIL ---
router.put('/profile', auth, checkEleveRole, elevePortalController.updateProfile);

// --- 3. PORTEFOLIO NUMÉRIQUE ---
router.get('/portfolio', auth, checkEleveRole, elevePortalController.listPortfolio);

router.post('/portfolio', auth, checkEleveRole, elevePortalController.addPortfolioItem);

router.put('/portfolio/:id', auth, checkEleveRole, elevePortalController.updatePortfolioItem);

router.delete('/portfolio/:id', auth, checkEleveRole, elevePortalController.deletePortfolioItem);

// --- 4. CV NUMÉRIQUE ÉVOLUTIF ---
router.get('/cv', auth, checkEleveRole, elevePortalController.getCv);

// --- 5. SUIVI ACADÉMIQUE (NOTES ET BULLETINS) ---
router.get('/notes', auth, checkEleveRole, elevePortalController.getNotes);

// --- 6. ÉVOLUTION DES NOTES POUR GRAPHIQUE ---
router.get('/notes-evolution', auth, checkEleveRole, elevePortalController.getNotesEvolution);

// --- 7. EMPLOI DU TEMPS ET EXAMENS PLANIFIÉS ---
router.get('/schedule', auth, checkEleveRole, elevePortalController.getSchedule);

// --- 8. RÉSULTATS EXAMENS NATIONAUX (Portail Office du BAC) ---
router.get('/exam-results', auth, checkEleveRole, elevePortalController.getExamResults);

// --- 9. DOCUMENTS TÉLÉCHARGEABLES ---
router.get('/documents', auth, checkEleveRole, elevePortalController.listDocuments);

// --- 10. NOTIFICATIONS ---
router.get('/notifications', auth, checkEleveRole, elevePortalController.listNotifications);

router.post('/notifications/read', auth, checkEleveRole, elevePortalController.markNotificationsRead);

// --- 11. MESSAGES REÇUS ---
router.get('/messages', auth, checkEleveRole, elevePortalController.listMessages);

// --- 12. ABSENCES POUR CALENDRIER DE TYPE GITHUB ---
router.get('/absences', auth, checkEleveRole, elevePortalController.listAbsences);

// --- 13. DEMANDES D'ATTESTATION D'INSCRIPTION ---
router.post('/attestations/request', auth, checkEleveRole, elevePortalController.requestAttestation);

router.get('/attestations/history', auth, checkEleveRole, elevePortalController.getAttestationHistory);

module.exports = router;
