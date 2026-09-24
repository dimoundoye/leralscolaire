const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const auth = require('../middleware/authMiddleware');
const { requireRole, requireClasseAccess } = require('../middleware/access');

// Classe de l'établissement de l'administrateur connecté
const ownClasse = requireClasseAccess('id');

// List classes
router.get('/', auth, classController.listClasses);

// Create class
router.post('/', auth, requireRole('ADMIN_ETABLISSEMENT'), classController.createClass);

// Modify class
router.put('/:id', auth, ownClasse, classController.updateClass);

// Assign subjects to class
router.post('/:id/matieres', auth, ownClasse, classController.assignMatieres);

// List subjects of a class
router.get('/:id/matieres', auth, ownClasse, classController.listMatieres);

// Get all exams for calendar (must place before parametrized :id routes to prevent conflict!)
router.get('/exams/all', auth, classController.getAllExams);

// Schedule management
router.post('/:id/schedule', auth, ownClasse, classController.addSchedule);
router.get('/:id/schedule', auth, ownClasse, classController.getSchedule);
router.delete('/:id/schedule/:scheduleId', auth, ownClasse, classController.deleteSchedule);

// Exam planification
router.post('/:id/exams', auth, ownClasse, classController.addExam);
router.get('/:id/exams', auth, ownClasse, classController.getExams);
router.put('/:id/exams/:examId', auth, ownClasse, classController.updateExam);
router.delete('/:id/exams/:examId', auth, ownClasse, classController.deleteExam);

module.exports = router;
