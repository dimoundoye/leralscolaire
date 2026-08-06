const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const preInscriptionController = require('../controllers/preInscriptionController');
const auth = require('../middleware/authMiddleware');

const photoUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = 'uploads/photos/';
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    }
  })
});

// PUBLIC: Get details of a class for enrollment
router.get('/public/class/:classId', preInscriptionController.getPublicClassDetails);

// PUBLIC: Submit pre-inscription form (with photo)
router.post('/public/register', photoUpload.single('photo'), preInscriptionController.submitPreInscription);

// ADMIN PROTECTED ROUTES

// List pending pre-inscriptions
router.get('/', auth, preInscriptionController.listPending);

// Modify pre-inscription details
router.put('/:id', auth, preInscriptionController.updatePreInscription);

// Validate pre-inscription (creates account/handles transfer)
router.post('/:id/validate', auth, preInscriptionController.validatePreInscription);

// Reject pre-inscription
router.post('/:id/reject', auth, preInscriptionController.rejectPreInscription);

module.exports = router;
