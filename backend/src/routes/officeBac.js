const express = require('express');
const router = express.Router();
const officeBacController = require('../controllers/officeBacController');

const auth = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/access');

const { publicFormLimiter } = require('../middleware/rateLimit');

// Middleware : réservé au rôle OFFICE_BAC
const checkOfficeBac = requireRole('OFFICE_BAC');

// ─────────────────────────────────────────────
// 1. STATISTIQUES GLOBALES & PALMARÈS
// ─────────────────────────────────────────────
router.get('/stats', auth, checkOfficeBac, officeBacController.getStats);

// ─────────────────────────────────────────────
// 1.B CARTOGRAPHIE RÉGIONALE DE LA RÉPUBLIQUE DU SÉNÉGAL (14 RÉGIONS)
// ─────────────────────────────────────────────
router.get('/carte-regionale', auth, checkOfficeBac, officeBacController.getCarteRegionale);

// Palmarès / Classement des meilleurs candidats
router.get('/palmares', auth, checkOfficeBac, officeBacController.getPalmares);

// ─────────────────────────────────────────────
// 2. LISTE & CRÉATION CANDIDATS (AVEC EXTENSIONS)
// ─────────────────────────────────────────────
router.get('/candidats', auth, checkOfficeBac, officeBacController.listCandidats);

// Historique des candidatures d'un élève (sessions antérieures)
router.get('/candidats/historique/:eleve_id', auth, checkOfficeBac, officeBacController.getCandidatHistorique);

// Enregistrer un nouveau candidat
router.post('/candidats', auth, checkOfficeBac, officeBacController.createCandidat);

// Mettre à jour les infos candidat
router.put('/candidats/:id', auth, checkOfficeBac, officeBacController.updateCandidat);

// Validation du dossier
router.put('/candidats/:id/dossier', auth, checkOfficeBac, officeBacController.updateCandidatDossier);

// Suspension avec motif
router.put('/candidats/:id/suspendre', auth, checkOfficeBac, officeBacController.suspendreCandidat);

// Génération automatique N° Table
router.post('/candidats/generer-numeros', auth, checkOfficeBac, officeBacController.genererNumerosTable);

// ─────────────────────────────────────────────
// 3. COEFFICIENTS PAR SÉRIE (CONFIGURATION)
// ─────────────────────────────────────────────
router.get('/coefficients', auth, checkOfficeBac, officeBacController.getCoefficients);

router.post('/coefficients', auth, checkOfficeBac, officeBacController.saveCoefficients);

// ─────────────────────────────────────────────
// 4. SAISIE RÉSULTATS, 2ÈME TOUR, VERROUILLAGE & ABSENCES
// ─────────────────────────────────────────────
router.put('/candidats/:id/resultats', auth, checkOfficeBac, officeBacController.saveCandidatResultats);

// Verrouiller / Déverrouiller la saisie après jury (Audit trail)
router.put('/candidats/:id/verrouiller', auth, checkOfficeBac, officeBacController.verrouillerCandidat);

// ─────────────────────────────────────────────
// 5. RELEVÉ CERTIFIÉ & VÉRIFICATION QR CODE
// ─────────────────────────────────────────────
router.get('/releve/:id', auth, checkOfficeBac, officeBacController.downloadReleve);

// Route publique de vérification d'authenticité QR Code
router.get('/verifier-qr/:hash', officeBacController.verifierQrReleve);

// ─────────────────────────────────────────────
// 6. PUBLICATION DES RÉSULTATS
// ─────────────────────────────────────────────
router.post('/publier', auth, checkOfficeBac, officeBacController.publierResultats);

// Recherche élèves
router.get('/eleves-search', auth, checkOfficeBac, officeBacController.searchEleves);

// ─────────────────────────────────────────────
// 7. GESTION DES ÉTABLISSEMENTS & IDENTIFIANTS UNIQUE
// ─────────────────────────────────────────────
router.get('/etablissements', auth, checkOfficeBac, officeBacController.listEtablissements);

router.post('/etablissements', auth, checkOfficeBac, officeBacController.createEtablissement);

// ─────────────────────────────────────────────
// 8. GESTION DES PROFESSEURS & IDENTIFIANTS UNIQUE
// ─────────────────────────────────────────────
router.get('/professeurs', auth, checkOfficeBac, officeBacController.listProfesseurs);

router.post('/professeurs', auth, checkOfficeBac, officeBacController.createProfesseur);

// ─────────────────────────────────────────────
// 9. AUTO-INSCRIPTION PUBLIQUE & VALIDATION PAR AGENTS
// ─────────────────────────────────────────────

// Route publique (sans auth) : formulaire d'inscription pour Établissement ou Professeur
router.post('/demande-public', publicFormLimiter, officeBacController.submitDemandePublique);

// Liste des demandes d'inscription publiques (pour agents Office BAC)
router.get('/demandes', auth, checkOfficeBac, officeBacController.listDemandes);

// Valider une demande publique et générer ID + MDP temporaire envoyé par Email
router.put('/demandes/:id/valider', auth, checkOfficeBac, officeBacController.validerDemande);

// Rejeter une demande publique et envoyer l'email de notification avec motif
router.put('/demandes/:id/rejeter', auth, checkOfficeBac, officeBacController.rejeterDemande);

// ─────────────────────────────────────────────
// 10. GESTION ET PARTAGE DES LIVRETS SCOLAIRES DU BAC
// ─────────────────────────────────────────────
router.get('/livrets', auth, checkOfficeBac, officeBacController.listLivrets);

router.post('/livrets', auth, checkOfficeBac, officeBacController.createLivret);

router.put('/livrets/:id/valider', auth, checkOfficeBac, officeBacController.validerLivret);

// ─────────────────────────────────────────────
// 11. REGISTRE & GESTION DES JURYS & CENTRES D'EXAMEN (OFFICE DU BAC)
// ─────────────────────────────────────────────

// Obtenir la liste des Jurys (avec filtre possible par région/série)
router.get('/jurys', auth, checkOfficeBac, officeBacController.listJurys);

// ─────────────────────────────────────────────
// GESTION DES CENTRES D'EXAMEN BAC (PRÉ-CONFIGURATION)
// ─────────────────────────────────────────────
router.get('/centres-examen', auth, checkOfficeBac, officeBacController.listCentresExamen);

router.post('/centres-examen', auth, checkOfficeBac, officeBacController.createCentreExamen);

router.put('/centres-examen/:id', auth, checkOfficeBac, officeBacController.updateCentreExamen);

router.delete('/centres-examen/:id', auth, checkOfficeBac, officeBacController.deleteCentreExamen);

// Créer un nouveau Jury (Office du BAC) et notifier le Président par messagerie
router.post('/jurys', auth, checkOfficeBac, officeBacController.createJury);

// Réattribuer ou corriger le jury et centre d'examen d'un candidat (Gestion des erreurs Office du BAC)
router.put('/candidats/:id/reattribuer-jury', auth, checkOfficeBac, officeBacController.reattribuerJury);

// ─────────────────────────────────────────────
// 8. ALGORITHME DE RÉPARTITION ALPHABÉTIQUE PAR CAPACITÉ ET ZONE
// ─────────────────────────────────────────────
router.post('/dispatch-alphabetique', auth, checkOfficeBac, officeBacController.dispatchAlphabetique);

// ─────────────────────────────────────────────
// 9. TRANSMISSION OFFICIELLE DES LIVRETS PAR L'ÉTABLISSEMENT VERS LA ZONE
// ─────────────────────────────────────────────
router.post(
  '/transmettre-livrets-zone',
  auth,
  requireRole('ADMIN_ETABLISSEMENT'),
  officeBacController.transmettreLivretsZone
);

// ─────────────────────────────────────────────
// 10. RESTITUTION GLOBALE DES LIVRETS AUX ÉTABLISSEMENTS (FIN DES ÉPREUVES)
// ─────────────────────────────────────────────
router.post('/restituer-livrets', auth, checkOfficeBac, officeBacController.restituerLivrets);

// Récupérer la date d'expiration globale de la session
router.get('/settings/expiration-date', auth, checkOfficeBac, officeBacController.getExpirationDate);

// Enregistrer la date d'expiration globale de la session
router.post('/settings/expiration-date', auth, checkOfficeBac, officeBacController.saveExpirationDate);

module.exports = router;
