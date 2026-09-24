const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { loginLimiter, forgotPasswordLimiter, resetPasswordLimiter, publicFormLimiter } = require('../middleware/rateLimit');

// Register Etablissement
router.post('/register-etablissement', publicFormLimiter, authController.registerEtablissement);

// Login
router.post('/login', loginLimiter, authController.login);

// Mot de passe oublié (IUP + Email) & Réinitialisation
router.post('/forgot-password', forgotPasswordLimiter, authController.forgotPassword);
router.post('/reset-password', resetPasswordLimiter, authController.resetPassword);

module.exports = router;
