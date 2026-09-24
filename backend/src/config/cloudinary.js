const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const isCloudinaryConfigured = Boolean(process.env.CLOUDINARY_URL);

// Identifiant de fichier aléatoire (non devinable) : le nom d'origine n'est jamais réutilisé
const randomFileId = () => `${Date.now()}-${crypto.randomBytes(12).toString('hex')}`;

// Nom de fichier local sûr : identifiant aléatoire + extension d'origine nettoyée
function safeFileName(originalname) {
  const ext = path.extname(String(originalname || '')).toLowerCase().replace(/[^a-z0-9.]/g, '').slice(0, 10);
  return randomFileId() + ext;
}

if (isCloudinaryConfigured) {
  console.log('☁️  Cloudinary configuré pour le stockage des fichiers');
} else {
  console.log('📁 Stockage local activé (CLOUDINARY_URL non défini)');
}

/**
 * Crée un middleware Multer configuré pour Cloudinary ou le disque local
 * @param {string} subFolder - Nom du sous-dossier (ex: 'photos', 'justificatifs')
 */
function createUploadMiddleware(subFolder = 'uploads') {
  if (isCloudinaryConfigured) {
    const storage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: async (req, file) => {
        const isPdf = file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf');
        return {
          folder: `leralscolaire/${subFolder}`,
          resource_type: isPdf ? 'raw' : 'auto',
          public_id: randomFileId(),
        };
      },
    });

    return multer({
      storage,
      limits: { fileSize: 10 * 1024 * 1024 } // 10MB
    });
  }

  // Fallback stockage local sur disque
  const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(__dirname, `../../uploads/${subFolder}`);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, safeFileName(file.originalname));
    }
  });

  return multer({
    storage: diskStorage,
    limits: { fileSize: 10 * 1024 * 1024 }
  });
}

/**
 * Récupère l'URL publique d'un fichier uploadé (soit Cloudinary https://..., soit URL locale /uploads/...)
 */
function getUploadedFileUrl(file, subFolder = '') {
  if (!file) return null;
  if (file.path && (file.path.startsWith('http://') || file.path.startsWith('https://'))) {
    return file.path;
  }
  const filename = file.filename || path.basename(file.path);
  return subFolder ? `/uploads/${subFolder}/${filename}` : `/uploads/${filename}`;
}

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  createUploadMiddleware,
  getUploadedFileUrl,
  randomFileId,
  safeFileName
};
