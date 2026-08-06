const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register Etablissement
router.post('/register-etablissement', authController.registerEtablissement);

// Login
router.post('/login', authController.login);

module.exports = router;
