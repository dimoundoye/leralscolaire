const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const partageController = require('../controllers/partageController');
const auth = require('../middleware/authMiddleware');

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = 'uploads/partages/';
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    }
  })
});

// Share document
router.post('/', auth, upload.single('fichier'), partageController.shareDocument);

// List received documents
router.get('/received', auth, partageController.getReceivedDocuments);

// List sent documents
router.get('/sent', auth, partageController.getSentDocuments);

// Download shared document
router.get('/:id/download', auth, partageController.downloadDocument);

// Delete shared document
router.delete('/:id', auth, partageController.deleteDocument);

// Mark as read
router.put('/:id/read', auth, partageController.markAsRead);

module.exports = router;
