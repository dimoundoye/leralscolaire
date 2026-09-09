/**
 * Service de Scellement Cryptographique et de Sécurité pour LeralScolaire
 * Génère et vérifie l'empreinte numérique SHA-256 des livrets scolaires scellés
 */
const crypto = require('crypto');

/**
 * Calcule l'empreinte cryptographique HMAC-SHA256 d'un livret scolaire avant transmission
 * @param {Object} payload - Données scolaires consolidées (IUP, notes, absences, année)
 * @param {String} secretKey - Clé secrète de l'établissement ou master secret de l'Office du Bac
 * @returns {String} Empreinte hexadécimale SHA-256 de 64 caractères
 */
function computeLivretHash(payload, secretKey = process.env.JWT_SECRET || 'leralscolaire_master_key_2026') {
  const dataString = JSON.stringify({
    iup: payload.iup || payload.identifiant_national,
    notes: payload.historique_notes || payload.notes,
    absences: payload.bilan_absences || payload.absences,
    annee: payload.annee_scolaire || payload.annee
  });
  
  return crypto
    .createHmac('sha256', secretKey)
    .update(dataString)
    .digest('hex');
}

/**
 * Vérifie si le livret présenté par un candidat correspond exactement à l'empreinte scellée
 * @param {Object} payload - Données du livret à vérifier
 * @param {String} expectedHash - Empreinte SHA-256 scellée en base de données
 * @param {String} secretKey - Clé secrète d'établissement
 * @returns {Boolean} True si le dossier est 100% authentique et non altéré
 */
function verifyLivretHash(payload, expectedHash, secretKey) {
  const computedHash = computeLivretHash(payload, secretKey);
  return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(expectedHash));
}

module.exports = {
  computeLivretHash,
  verifyLivretHash
};
