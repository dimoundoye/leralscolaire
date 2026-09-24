// Session utilisateur portée par un cookie httpOnly : le jeton n'est jamais accessible
// au JavaScript de la page (protection contre le vol de session par XSS).
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/secrets');

const SESSION_COOKIE = 'leral_session';
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

const cookieOptions = () => ({
  httpOnly: true,
  // HTTPS obligatoire (les navigateurs l'autorisent aussi sur http://localhost en développement)
  secure: process.env.COOKIE_SECURE !== 'false',
  sameSite: 'strict',
  path: '/',
});

/**
 * Ouvre la session : signe le jeton, le pose en cookie et renvoie les informations utilisateur.
 * @param {object} claims - contenu utile aux contrôles d'accès (id, role, jury...)
 * @param {object} user - informations affichées par l'interface (renvoyées aussi par /api/auth/me)
 */
function startSession(res, claims, user) {
  const token = jwt.sign({ ...claims, user }, JWT_SECRET, { expiresIn: SESSION_DURATION_MS / 1000 });
  res.cookie(SESSION_COOKIE, token, { ...cookieOptions(), maxAge: SESSION_DURATION_MS });
  return res.json({ user });
}

function clearSession(res) {
  res.clearCookie(SESSION_COOKIE, cookieOptions());
}

// Jeton de session : cookie en priorité, puis en-tête Authorization (scripts, tests)
function readSessionToken(req) {
  const cookies = Object.fromEntries(
    String(req.headers.cookie || '')
      .split(';')
      .map((part) => part.trim().split('='))
      .filter(([name, value]) => name && value)
      .map(([name, ...value]) => [name, decodeURIComponent(value.join('='))])
  );
  if (cookies[SESSION_COOKIE]) return cookies[SESSION_COOKIE];

  const header = req.header('Authorization') || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
}

module.exports = { startSession, clearSession, readSessionToken, SESSION_COOKIE };
