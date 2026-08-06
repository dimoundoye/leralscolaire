const fs = require('fs');
const PartageModel = require('../models/partageModel');
const response = require('../utils/response');

const partageController = {
  async shareDocument(req, res, next) {
    try {
      const { destinataire_etablissement_id, description, eleve_id } = req.body;

      const expediteurId = await PartageModel.getEtablissementIdByAdminId(req.user.id);
      if (!expediteurId) {
        return response.error(res, 'Établissement non trouvé.', 404);
      }

      if (!req.file) return response.error(res, 'Fichier requis.', 400);

      const document = await PartageModel.shareDocument({
        expediteurId,
        destinataireEtablissementId: destinataire_etablissement_id,
        eleveId: eleve_id,
        nomFichier: req.file.originalname,
        cheminFichier: req.file.path,
        taille: req.file.size,
        typeFichier: req.file.mimetype,
        description
      });

      return res.json(document);
    } catch (err) {
      console.error(err);
      return response.error(res, "Erreur lors de l'envoi du document.", 500);
    }
  },

  async getReceivedDocuments(req, res, next) {
    try {
      const etablissementId = await PartageModel.getEtablissementIdByAdminId(req.user.id);
      if (!etablissementId) {
        return response.error(res, 'Établissement non trouvé.', 404);
      }

      const docs = await PartageModel.getReceivedDocuments(etablissementId);
      return res.json(docs);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors du chargement.', 500);
    }
  },

  async getSentDocuments(req, res, next) {
    try {
      const etablissementId = await PartageModel.getEtablissementIdByAdminId(req.user.id);
      if (!etablissementId) {
        return response.error(res, 'Établissement non trouvé.', 404);
      }

      const docs = await PartageModel.getSentDocuments(etablissementId);
      return res.json(docs);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors du chargement.', 500);
    }
  },

  async downloadDocument(req, res, next) {
    try {
      const etablissementId = await PartageModel.getEtablissementIdByAdminId(req.user.id);
      if (!etablissementId) {
        return response.error(res, 'Établissement non trouvé.', 404);
      }

      const doc = await PartageModel.getDocumentByIdAndEtablissement(req.params.id, etablissementId);
      if (!doc) {
        return response.error(res, 'Document non trouvé.', 404);
      }

      const filePath = doc.chemin_fichier;
      if (!fs.existsSync(filePath)) {
        return response.error(res, 'Fichier introuvable sur le serveur.', 404);
      }

      // Mark as read if the recipient downloads
      if (doc.destinataire_etablissement_id === etablissementId && !doc.lu) {
        await PartageModel.markAsRead(req.params.id);
      }

      return res.download(filePath, doc.nom_fichier);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors du téléchargement.', 500);
    }
  },

  async deleteDocument(req, res, next) {
    try {
      const etablissementId = await PartageModel.getEtablissementIdByAdminId(req.user.id);
      if (!etablissementId) {
        return response.error(res, 'Établissement non trouvé.', 404);
      }

      const doc = await PartageModel.getDocumentByIdAndEtablissement(req.params.id, etablissementId);
      if (!doc) {
        return response.error(res, 'Document non trouvé.', 404);
      }

      // Delete file from disk
      try {
        fs.unlinkSync(doc.chemin_fichier);
      } catch (e) {
        /* ignore */
      }

      await PartageModel.deleteDocument(req.params.id);
      return res.json({ message: 'Document supprimé.' });
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la suppression.', 500);
    }
  },

  async markAsRead(req, res, next) {
    try {
      await PartageModel.markAsRead(req.params.id);
      return res.json({ message: 'OK' });
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur.', 500);
    }
  }
};

module.exports = partageController;
