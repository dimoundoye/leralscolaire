const express = require('express');
const router = express.Router();
const multer = require('multer');
const aiController = require('../controllers/aiController');
const auth = require('../middleware/authMiddleware');

const upload = multer({ dest: 'uploads/' });

// Scan student list from image
router.post('/scan-students', auth, upload.single('image'), aiController.scanStudents);

// Scan notes from sheet image
router.post('/scan-notes', auth, upload.single('image'), aiController.scanNotes);

module.exports = router;
