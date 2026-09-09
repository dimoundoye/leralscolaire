const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register Etablissement
router.post('/register-etablissement', authController.registerEtablissement);

// Login
router.post('/login', authController.login);

// Mot de passe oublié (IUP + Email) & Réinitialisation
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
