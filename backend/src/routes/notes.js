const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const auth = require('../middleware/authMiddleware');
const { requireRole, requireClasseAccess, requireEleveAccess } = require('../middleware/access');

const gestionMatieres = requireRole('ADMIN_ETABLISSEMENT', 'OFFICE_BAC');
const ownClasse = requireClasseAccess('classeId');
const ownEleve = requireEleveAccess('eleveId');
const adminOnly = requireRole('ADMIN_ETABLISSEMENT');

// Get all subjects
router.get('/matieres', auth, noteController.listMatieres);

// Create subject
router.post('/matieres', auth, gestionMatieres, noteController.createMatiere);

// Modify subject
router.put('/matieres/:id', auth, gestionMatieres, noteController.updateMatiere);

// Delete subject
router.delete('/matieres/:id', auth, gestionMatieres, noteController.deleteMatiere);

// Average metrics for dashboard (must be above parametrized routes)
router.get('/moyennes-classes', auth, noteController.getClassesMoyennesDashboard);

// Rules of promotion
router.get('/regles-passage', auth, noteController.getPromotionRules);
router.put('/regles-passage', auth, noteController.savePromotionRules);

// Calculate averages for a class
router.get('/moyennes/:classeId', auth, ownClasse, noteController.getClassMoyennes);

// Get student notes for a class and subject
router.get('/classe/:classeId/matiere/:matiereId', auth, ownClasse, noteController.getNotesByClassAndMatiere);

// Save notes in batch (with history logs)
router.post('/batch', auth, noteController.saveBatchNotes);

// Promotion decisions
router.get('/decisions/:classeId', auth, ownClasse, noteController.getDecisions);
router.post('/decisions/:classeId', auth, adminOnly, ownClasse, noteController.saveDecisions);

// Get student notes for admin/teachers
router.get('/eleve/:eleveId', auth, ownEleve, noteController.getStudentNotesForAdmin);

// Get class ranking
router.get('/classe/:classeId/classement', auth, ownClasse, noteController.getClassRanking);

// Save student jury decision
router.post('/eleve/:eleveId/decision', auth, adminOnly, ownEleve, noteController.saveStudentJuryDecision);

// Get school-wide grading progress tracking
router.get('/suivi-remplissage', auth, noteController.getSuiviRemplissage);

// Bulletins publication settings
router.get('/publications/:classeId', auth, ownClasse, noteController.getBulletinsPublication);
router.post('/publications/:classeId', auth, adminOnly, ownClasse, noteController.saveBulletinsPublication);

module.exports = router;
