const express = require('express');
const router = express.Router();
const multer = require('multer');
const aiController = require('../controllers/aiController');
const auth = require('../middleware/authMiddleware');

// Images à analyser : dossier temporaire du système (supprimées après traitement)
const upload = multer({
  dest: require('os').tmpdir(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, file.mimetype.startsWith('image/')),
});

// Scan student list from image
router.post('/scan-students', auth, upload.single('image'), aiController.scanStudents);

// Scan notes from sheet image
router.post('/scan-notes', auth, upload.single('image'), aiController.scanNotes);

module.exports = router;
