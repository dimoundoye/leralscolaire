const express = require('express');
const router = express.Router();
const cahierTexteController = require('../controllers/cahierTexteController');
const auth = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads/cahier_texte directory exists
const uploadDir = path.join(__dirname, '../../uploads/cahier_texte');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB max file size
});

// Professor routes
router.post('/', auth, cahierTexteController.createEntry);
router.post('/upload', auth, upload.single('fichier'), cahierTexteController.uploadFile);
router.get('/professeur', auth, cahierTexteController.getProfesseurEntries);

// Student routes
router.get('/eleve', auth, cahierTexteController.getEleveEntries);

// Admin routes
router.get('/admin', auth, cahierTexteController.getAdminEntries);
router.put('/:id/visa', auth, cahierTexteController.toggleAdminVisa);

// Delete route
router.delete('/:id', auth, cahierTexteController.deleteEntry);

module.exports = router;
