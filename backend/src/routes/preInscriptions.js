const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const preInscriptionController = require('../controllers/preInscriptionController');
const auth = require('../middleware/authMiddleware');
const { requireOwnRecord } = require('../middleware/access');
const { publicFormLimiter } = require('../middleware/rateLimit');

const { createUploadMiddleware } = require('../config/cloudinary');

const photoUpload = createUploadMiddleware('photos');

// PUBLIC: Get details of a class for enrollment
router.get('/public/class/:classId', preInscriptionController.getPublicClassDetails);

// PUBLIC: Submit pre-inscription form (with photo)
router.post('/public/register', publicFormLimiter, photoUpload.single('photo'), preInscriptionController.submitPreInscription);

// ADMIN PROTECTED ROUTES

// List pending pre-inscriptions
router.get('/', auth, preInscriptionController.listPending);

// Modify pre-inscription details
router.put('/:id', auth, requireOwnRecord('pre_inscriptions'), preInscriptionController.updatePreInscription);

// Validate pre-inscription (creates account/handles transfer)
router.post('/:id/validate', auth, requireOwnRecord('pre_inscriptions'), preInscriptionController.validatePreInscription);

// Reject pre-inscription
router.post('/:id/reject', auth, requireOwnRecord('pre_inscriptions'), preInscriptionController.rejectPreInscription);

module.exports = router;
