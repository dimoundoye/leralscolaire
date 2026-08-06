const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const etablissementController = require('../controllers/etablissementController');
const auth = require('../middleware/authMiddleware');

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = 'uploads/etablissements/';
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    }
  })
});

// Get profile details
router.get('/profile', auth, etablissementController.getProfile);

// Update profile details
router.put('/profile', auth, upload.fields([
  { name: 'signature', maxCount: 1 },
  { name: 'cachet', maxCount: 1 }
]), etablissementController.updateProfile);

// Search establishments
router.get('/search', auth, etablissementController.searchEtablissements);

// Baremes d'appréciation
router.get('/baremes', auth, etablissementController.getBaremes);
router.put('/baremes', auth, etablissementController.saveBaremes);

// Journal d'audit des modifications de notes
router.get('/audit', auth, etablissementController.getAuditLog);

// Absences & Retards tracking & justification
router.get('/absences', auth, etablissementController.getAbsencesLog);
router.put('/absences/:id/justifier', auth, etablissementController.justifyAbsence);

// Propositions d'évaluations/devoirs par les profs
router.get('/planning/propositions', auth, etablissementController.getProposedDevoirs);
router.put('/planning/propositions/:id/decider', auth, etablissementController.decideProposedDevoir);

// Confirmer ou rejeter la modification de note
router.post('/audit/:id/confirm', auth, etablissementController.confirmAuditLog);
router.post('/audit/:id/reject', auth, etablissementController.rejectAuditLog);

module.exports = router;
