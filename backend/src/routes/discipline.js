const express = require('express');
const router = express.Router();
const disciplineController = require('../controllers/disciplineController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Création d'un signalement, convocation ou remarque
router.post('/', disciplineController.createSignalement);

// Obtenir le registre Vie Scolaire côté Établissement
router.get('/etablissement', disciplineController.getSignalementsEtablissement);

// Obtenir les signalements soumis par le professeur connecté
router.get('/professeur', disciplineController.getSignalementsProfesseur);

// Obtenir le dossier complet et les remarques d'un élève
router.get('/eleve/:id', disciplineController.getSignalementsEleve);

// Télécharger l'export PDF du Dossier Scolaire Individuel
router.get('/eleve/:id/pdf', disciplineController.downloadDossierPdf);

// Mettre à jour le statut d'une convocation ou d'un signalement (ex: Honoré, Résolu)
router.put('/:id/statut', disciplineController.updateStatut);

module.exports = router;
