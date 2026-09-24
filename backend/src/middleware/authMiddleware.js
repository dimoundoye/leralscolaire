const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/secrets');
const { readSessionToken } = require('../utils/session');

// Authentification par le cookie de session (ou l'en-tête Authorization).
// Le jeton n'est jamais accepté dans l'URL : il finirait dans les journaux et l'historique.
const authMiddleware = (req, res, next) => {
  const token = readSessionToken(req);

  if (!token) {
    return res.status(401).json({ message: 'Accès refusé. Aucun jeton fourni.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Contient l'ID et le rôle de l'utilisateur (decoded.id, decoded.role)
    next();
  } catch (err) {
    res.status(401).json({ message: 'Jeton invalide.' });
  }
};

authMiddleware.authenticateToken = authMiddleware;

module.exports = authMiddleware;
