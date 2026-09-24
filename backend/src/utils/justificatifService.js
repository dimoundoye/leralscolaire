// Enregistrement sécurisé des pièces justificatives envoyées en base64 par le formulaire public
// d'inscription à l'Office du Bac (utilisateurs non authentifiés).
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

// Seules ces pièces sont attendues : toute autre clé est ignorée
const ALLOWED_DOC_KEYS = ['doc_autorisation', 'doc_cni', 'doc_ninea_ou_diplome', 'doc_rib_ou_pv'];
const MAX_DOC_BYTES = 4 * 1024 * 1024;

// Type déclaré → extension et signature binaire attendue (le contenu réel est vérifié)
const ALLOWED_TYPES = {
  'application/pdf': { ext: '.pdf', magic: Buffer.from('%PDF') },
  'image/png': { ext: '.png', magic: Buffer.from([0x89, 0x50, 0x4e, 0x47]) },
  'image/jpeg': { ext: '.jpg', magic: Buffer.from([0xff, 0xd8, 0xff]) },
};

const UPLOADS_DIR = path.join(__dirname, '../../uploads');

class JustificatifError extends Error {}

function decodeDocument(key, item) {
  const match = /^data:([a-z]+\/[a-z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/i.exec(String(item?.data || ''));
  const type = match && ALLOWED_TYPES[match[1].toLowerCase()];
  if (!type) {
    throw new JustificatifError(`La pièce « ${key} » doit être un fichier PDF, PNG ou JPEG.`);
  }
  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.length > MAX_DOC_BYTES) {
    throw new JustificatifError(`La pièce « ${key} » dépasse la taille maximale de 4 Mo.`);
  }
  if (!buffer.subarray(0, type.magic.length).equals(type.magic)) {
    throw new JustificatifError(`Le contenu de la pièce « ${key} » ne correspond pas à son type.`);
  }
  return { buffer, mime: match[1].toLowerCase(), ext: type.ext };
}

/**
 * Valide et enregistre les pièces justificatives.
 * @returns {Promise<Object>} { clé: URL Cloudinary ou nom de fichier local }
 * @throws {JustificatifError} si une pièce est invalide (à renvoyer en 400)
 */
async function saveJustificatifs(documents) {
  const saved = {};
  if (!documents || typeof documents !== 'object') return saved;

  for (const key of ALLOWED_DOC_KEYS) {
    const item = documents[key];
    if (!item) continue;

    const { buffer, mime, ext } = decodeDocument(key, item);
    const fileId = `justificatif_${crypto.randomUUID()}`;

    if (isCloudinaryConfigured) {
      try {
        const result = await cloudinary.uploader.upload(`data:${mime};base64,${buffer.toString('base64')}`, {
          folder: 'leralscolaire/justificatifs',
          resource_type: mime === 'application/pdf' ? 'raw' : 'image',
          public_id: fileId,
        });
        if (result?.secure_url) {
          saved[key] = result.secure_url;
          continue;
        }
      } catch (err) {
        console.warn(`⚠️ Échec upload Cloudinary pour ${key}, repli local :`, err.message);
      }
    }

    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    const fileName = fileId + ext;
    fs.writeFileSync(path.join(UPLOADS_DIR, fileName), buffer);
    saved[key] = fileName;
  }

  return saved;
}

module.exports = { saveJustificatifs, JustificatifError, ALLOWED_DOC_KEYS };
