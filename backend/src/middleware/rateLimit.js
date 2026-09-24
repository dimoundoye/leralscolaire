// Limitation du nombre de requêtes par adresse IP sur les routes sensibles
// (connexion, réinitialisation de mot de passe, formulaires publics).
const { rateLimit } = require('express-rate-limit');

const limiter = (windowMinutes, limit, message, options = {}) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { message },
    ...options,
  });

module.exports = {
  // Les connexions réussies ne sont pas comptées : seuls les échecs répétés bloquent
  loginLimiter: limiter(15, 10, 'Trop de tentatives de connexion. Réessayez dans 15 minutes.', {
    skipSuccessfulRequests: true,
  }),
  forgotPasswordLimiter: limiter(60, 5, 'Trop de demandes de réinitialisation. Réessayez dans une heure.'),
  resetPasswordLimiter: limiter(15, 10, 'Trop de tentatives de réinitialisation. Réessayez dans 15 minutes.'),
  publicFormLimiter: limiter(60, 10, 'Trop de demandes envoyées. Réessayez dans une heure.'),
};
