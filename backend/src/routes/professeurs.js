const express = require('express');
const router = Router = express.Router();
const profController = require('../controllers/profController');
const auth = require('../middleware/authMiddleware');

// List professors
router.get('/', auth, profController.listProfesseurs);

// Create professor
router.post('/', auth, profController.createProfesseur);

// Modify professor
router.put('/:id', auth, profController.updateProfesseur);

// Delete/unlink professor
router.delete('/:id', auth, profController.deleteProfesseur);

// Search professor by national ID
router.get('/search/:identifiant', auth, profController.searchProfesseur);

// Invite professor to school
router.post('/invite', auth, profController.inviteProfesseur);

// List direct teacher assignments for this school
router.get('/:id/assignments', auth, profController.listAssignments);

// Create a direct teacher assignment
router.post('/assignments', auth, profController.createAssignment);

// Delete a direct teacher assignment
router.delete('/assignments/:id', auth, profController.deleteAssignment);

// Toggle messaging permission for teacher in school
router.put('/:id/permission', auth, profController.toggleMessagePermission);

module.exports = router;

