const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_tres_prive';

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '') || req.query.token;

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

module.exports = authMiddleware;
