const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const studentController = require('../controllers/studentController');
const auth = require('../middleware/authMiddleware');

const { isCloudinaryConfigured, cloudinary } = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const upload = multer({ dest: 'uploads/' });

let photoAndJustifStorage;
if (isCloudinaryConfigured) {
  photoAndJustifStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      const isPdf = file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf');
      const subFolder = file.fieldname === 'photo' ? 'photos' : 'justificatifs_inapte';
      return {
        folder: `leralscolaire/${subFolder}`,
        resource_type: isPdf ? 'raw' : 'auto',
        public_id: `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9_-]/g, '_')}`
      };
    }
  });
} else {
  photoAndJustifStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      let dir;
      if (file.fieldname === 'photo') {
        dir = 'uploads/photos/';
      } else if (file.fieldname === 'justificatif_inapte') {
        dir = 'uploads/justificatifs_inapte/';
      } else {
        dir = 'uploads/';
      }
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_'));
    }
  });
}

const photoAndJustifUpload = multer({
  storage: photoAndJustifStorage,
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'justificatif_inapte') {
      const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
      if (!allowed.includes(file.mimetype)) {
        return cb(new Error('Seuls les fichiers PDF et images sont acceptés comme justificatif.'));
      }
    }
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB max
});

const fileFields = photoAndJustifUpload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'justificatif_inapte', maxCount: 1 }
]);

// List all students
router.get('/', auth, studentController.listStudents);

// Enroll student (with photo + optional justificatif inapte)
router.post('/', auth, fileFields, studentController.enrollStudent);

// Import Excel sheet
router.post('/import', auth, upload.single('file'), studentController.importStudents);

// Export Excel list
router.get('/export', auth, studentController.exportStudents);

// Modify student (with photo + optional justificatif inapte)
router.put('/:id', auth, fileFields, studentController.updateStudent);

// Delete student
router.delete('/:id', auth, studentController.deleteStudent);

// Assign student to class
router.post('/:id/assign-class', auth, studentController.assignClass);

// Transfer student (single & bulk)
router.post('/transfer-bulk', auth, studentController.bulkTransferStudents);
router.post('/:id/transfer', auth, studentController.transferStudent);

// Transfer management routes
router.get('/transfers/incoming', auth, studentController.listIncomingTransfers);
router.get('/transfers/outgoing', auth, studentController.listOutgoingTransfers);
router.post('/transfers/:id/accept', auth, studentController.acceptTransfer);
router.post('/transfers/:id/reject', auth, studentController.rejectTransfer);
router.delete('/transfers/:id/cancel', auth, studentController.cancelTransfer);

module.exports = router;
