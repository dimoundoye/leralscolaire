const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { loginLimiter, forgotPasswordLimiter, resetPasswordLimiter } = require('../middleware/rateLimit');
const auth = require('../middleware/authMiddleware');

// Les établissements ne s'inscrivent plus directement : ils passent par la demande
// validée par l'Office du Bac (POST /api/office-bac/demande-public).

// Login
router.post('/login', loginLimiter, authController.login);

// Session en cours et déconnexion (cookie httpOnly)
router.get('/me', auth, authController.me);
router.post('/logout', authController.logout);

// Mot de passe oublié (IUP + Email) & Réinitialisation
router.post('/forgot-password', forgotPasswordLimiter, authController.forgotPassword);
router.post('/reset-password', resetPasswordLimiter, authController.resetPassword);

module.exports = router;
