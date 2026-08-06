const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const auth = require('../middleware/authMiddleware');

// Get all subjects
router.get('/matieres', auth, noteController.listMatieres);

// Create subject
router.post('/matieres', auth, noteController.createMatiere);

// Modify subject
router.put('/matieres/:id', auth, noteController.updateMatiere);

// Delete subject
router.delete('/matieres/:id', auth, noteController.deleteMatiere);

// Average metrics for dashboard (must be above parametrized routes)
router.get('/moyennes-classes', auth, noteController.getClassesMoyennesDashboard);

// Rules of promotion
router.get('/regles-passage', auth, noteController.getPromotionRules);
router.put('/regles-passage', auth, noteController.savePromotionRules);

// Calculate averages for a class
router.get('/moyennes/:classeId', auth, noteController.getClassMoyennes);

// Get student notes for a class and subject
router.get('/classe/:classeId/matiere/:matiereId', auth, noteController.getNotesByClassAndMatiere);

// Save notes in batch (with history logs)
router.post('/batch', auth, noteController.saveBatchNotes);

// Promotion decisions
router.get('/decisions/:classeId', auth, noteController.getDecisions);
router.post('/decisions/:classeId', auth, noteController.saveDecisions);

// Get student notes for admin/teachers
router.get('/eleve/:eleveId', auth, noteController.getStudentNotesForAdmin);

// Get class ranking
router.get('/classe/:classeId/classement', auth, noteController.getClassRanking);

// Save student jury decision
router.post('/eleve/:eleveId/decision', auth, noteController.saveStudentJuryDecision);

// Get school-wide grading progress tracking
router.get('/suivi-remplissage', auth, noteController.getSuiviRemplissage);

// Bulletins publication settings
router.get('/publications/:classeId', auth, noteController.getBulletinsPublication);
router.post('/publications/:classeId', auth, noteController.saveBulletinsPublication);

module.exports = router;
