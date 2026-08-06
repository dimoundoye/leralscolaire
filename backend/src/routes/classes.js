const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const auth = require('../middleware/authMiddleware');

// List classes
router.get('/', auth, classController.listClasses);

// Create class
router.post('/', auth, classController.createClass);

// Modify class
router.put('/:id', auth, classController.updateClass);

// Assign subjects to class
router.post('/:id/matieres', auth, classController.assignMatieres);

// List subjects of a class
router.get('/:id/matieres', auth, classController.listMatieres);

// Get all exams for calendar (must place before parametrized :id routes to prevent conflict!)
router.get('/exams/all', auth, classController.getAllExams);

// Schedule management
router.post('/:id/schedule', auth, classController.addSchedule);
router.get('/:id/schedule', auth, classController.getSchedule);
router.delete('/:id/schedule/:scheduleId', auth, classController.deleteSchedule);

// Exam planification
router.post('/:id/exams', auth, classController.addExam);
router.get('/:id/exams', auth, classController.getExams);
router.put('/:id/exams/:examId', auth, classController.updateExam);
router.delete('/:id/exams/:examId', auth, classController.deleteExam);

module.exports = router;
