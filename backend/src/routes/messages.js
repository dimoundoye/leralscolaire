const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const auth = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads/messages directory exists
const uploadDir = path.join(__dirname, '../../uploads/messages');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const { createUploadMiddleware } = require('../config/cloudinary');

const upload = createUploadMiddleware('messages');

// Upload attachment
router.post('/upload', auth, upload.single('fichier'), messageController.uploadFile);

// Send message (supports all destination types + optional file attachment)
router.post('/', auth, messageController.sendMessage);

// Inbox messages (role-aware)
router.get('/inbox', auth, messageController.getInbox);

// Get channel list for sidebar
router.get('/channels', auth, messageController.getChannels);

// Get message history for a specific channel
// Query params: type=ADMIN|CLASSE|OFFICE_BAC|PROFESSEUR|ELEVE, target_id=<uuid>, etablissement_id=<uuid>
router.get('/history', auth, messageController.getChannelHistory);

module.exports = router;

