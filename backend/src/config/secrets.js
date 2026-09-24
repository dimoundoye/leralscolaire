// Secrets applicatifs. Aucune valeur par défaut : une clé absente ou trop courte
// bloque le démarrage plutôt que de retomber sur une valeur connue publiquement.
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error(
    'JWT_SECRET manquant ou trop court (32 caractères minimum). ' +
      "Générez-en un avec : node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\""
  );
}

module.exports = { JWT_SECRET };
