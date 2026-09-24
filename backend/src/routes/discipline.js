const express = require('express');
const router = express.Router();
const disciplineController = require('../controllers/disciplineController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole, requireEleveAccess } = require('../middleware/access');

const personnel = requireRole('ADMIN_ETABLISSEMENT', 'PROFESSEUR');
// Dossier consultable par l'élève lui-même, son établissement (y compris d'accueil en cas de
// transfert en attente) et les professeurs rattachés à son établissement
const dossierEleve = requireEleveAccess('id', { allowProf: true, allowIncomingTransfer: true });

router.use(authMiddleware);

// Création d'un signalement, convocation ou remarque
router.post('/', personnel, disciplineController.createSignalement);

// Obtenir le registre Vie Scolaire côté Établissement
router.get('/etablissement', requireRole('ADMIN_ETABLISSEMENT'), disciplineController.getSignalementsEtablissement);

// Obtenir les signalements soumis par le professeur connecté
router.get('/professeur', requireRole('PROFESSEUR'), disciplineController.getSignalementsProfesseur);

// Obtenir le dossier complet et les remarques d'un élève
router.get('/eleve/:id', dossierEleve, disciplineController.getSignalementsEleve);

// Télécharger l'export PDF du Dossier Scolaire Individuel
router.get('/eleve/:id/pdf', dossierEleve, disciplineController.downloadDossierPdf);

// Mettre à jour le statut d'une convocation ou d'un signalement (ex: Honoré, Résolu)
router.put('/:id/statut', personnel, disciplineController.updateStatut);

module.exports = router;
