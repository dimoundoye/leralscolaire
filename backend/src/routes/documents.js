const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');

const auth = require('../middleware/authMiddleware');
const { requireEleveAccess, requireClasseAccess } = require('../middleware/access');

// Livret consultable par l'élève, son établissement et l'établissement d'accueil d'un transfert en attente
const livretEleve = requireEleveAccess('eleveId', { allowIncomingTransfer: true });

// --- GÉNÉRATION BULLETIN PDF (MODELE SÉNÉGALISÉ 1ER & 2ÈME SEMESTRE) ---
router.get('/bulletin/:eleveId', auth, livretEleve, documentController.downloadBulletin);

router.get('/attestation/:eleveId', auth, documentController.downloadAttestation);

// --- DOSSIER DE TRANSFERT ---
router.get('/dossier-transfert/:eleveId', auth, livretEleve, documentController.downloadDossierTransfert);

// --- ATTESTATION REQUESTS FOR ESTABLISHMENTS ---

// Get all requests for the current establishment
router.get('/attestations/requests', auth, documentController.listAttestationRequests);

// Accept a request
router.post('/attestations/requests/:id/accept', auth, documentController.acceptAttestationRequest);

// Refuse a request
router.post('/attestations/requests/:id/refuse', auth, documentController.refuseAttestationRequest);

// --- CLASSEMENT PDF DE LA CLASSE ---
router.get(
  '/classe/:classeId/classement-pdf',
  auth,
  requireClasseAccess('classeId'),
  documentController.downloadClassementPdf
);

module.exports = router;
