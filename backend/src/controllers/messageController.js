const MessageModel = require('../models/messageModel');
const db = require('../config/db');
const response = require('../utils/response');

const messageController = {
  async sendMessage(req, res, next) {
    const { destinataire_type, destinataire_id, sujet, contenu, etablissement_id, fichier_url, fichier_nom } = req.body;
    try {
      let finalEtablissementId = etablissement_id;

      // 1. If destination is CLASSE, check teacher permission and find establishment_id
      if (destinataire_type === 'CLASSE') {
        const classRes = await db.query('SELECT etablissement_id FROM classes WHERE id = $1', [destinataire_id]);
        if (classRes.rows.length === 0) {
          return response.error(res, 'Classe non trouvée.', 404);
        }
        finalEtablissementId = classRes.rows[0].etablissement_id;

        if (req.user.role === 'PROFESSEUR') {
          const permRes = await db.query(`
            SELECT droit_envoi_message 
            FROM professeurs_etablissements 
            WHERE professeur_id = $1 AND etablissement_id = $2 AND statut = 'ACCEPTE'
          `, [req.user.id, finalEtablissementId]);
          
          if (permRes.rows.length === 0 || !permRes.rows[0].droit_envoi_message) {
            return response.error(res, "Vous n'avez pas la permission d'envoyer des messages aux classes de cet établissement.", 403);
          }
        }
      }

      // 2. If destination is ADMIN_ETABLISSEMENT, destinataire_id is the establishment_id
      let finalDestId = destinataire_id;
      if (destinataire_type === 'ADMIN_ETABLISSEMENT') {
        const etabRes = await db.query('SELECT admin_id FROM etablissements WHERE id = $1', [destinataire_id]);
        if (etabRes.rows.length === 0) {
          return response.error(res, 'Établissement non trouvé.', 404);
        }
        finalDestId = etabRes.rows[0].admin_id;
        finalEtablissementId = destinataire_id; // Set etablissement_id directly
      } else if (destinataire_type === 'PROFESSEUR' && !finalEtablissementId) {
        const etabRes = await db.query('SELECT etablissement_id FROM eleves WHERE user_id = $1', [req.user.id]);
        finalEtablissementId = etabRes.rows[0]?.etablissement_id;
      }

      const message = await MessageModel.sendMessage(
        req.user.id, destinataire_type, finalDestId, sujet, contenu, finalEtablissementId, fichier_url, fichier_nom
      );
      return res.status(201).json(message);
    } catch (err) {
      console.error(err);
      return response.error(res, "Erreur lors de l'envoi du message.", 500);
    }
  },

  async uploadFile(req, res, next) {
    try {
      if (!req.file) {
        return response.error(res, 'Aucun fichier sélectionné.', 400);
      }
      const fichierUrl = `/uploads/messages/${req.file.filename}`;
      return res.json({
        fichier_url: fichierUrl,
        fichier_nom: req.file.originalname
      });
    } catch (err) {
      console.error('Erreur upload fichier message:', err);
      return response.error(res, 'Erreur lors du téléchargement du fichier.', 500);
    }
  },

  async getInbox(req, res, next) {
    try {
      const messages = await MessageModel.getInboxMessages(req.user.role, req.user.id);
      return res.json(messages);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur serveur.', 500);
    }
  },

  async getChannels(req, res, next) {
    try {
      const { role } = req.user;
      if (role === 'PROFESSEUR') {
        const etabs = await MessageModel.getTeacherEtablissements(req.user.id);
        const classes = await MessageModel.getTeacherClasses(req.user.id);
        return res.json({ etablissements: etabs, classes });
      } else if (role === 'ADMIN_ETABLISSEMENT') {
        const etablissementId = await MessageModel.getEtablissementIdByAdminId(req.user.id);
        if (!etablissementId) {
          return response.error(res, 'Établissement non trouvé.', 404);
        }
        const teachers = await MessageModel.getAdminEtablissementTeachers(etablissementId);
        const students = await MessageModel.getAdminEtablissementStudents(etablissementId);
        return res.json({ teachers, students, etablissement_id: etablissementId });
      } else if (role === 'ELEVE') {
        const adminDetails = await MessageModel.getEtablissementAdminDetails(req.user.id);
        const student = await MessageModel.getStudentDetailsByUserId(req.user.id);
        let classe = null;
        let teachers = [];

        if (student) {
          const { rows: classRows } = await db.query(`
            SELECT c.id as classe_id, c.nom as classe_nom, c.annee_scolaire, c.etablissement_id
            FROM inscription_classes ic
            JOIN classes c ON ic.classe_id = c.id
            WHERE ic.eleve_id = $1
            ORDER BY ic.date_inscription DESC
            LIMIT 1
          `, [student.id]);

          if (classRows.length > 0) {
            classe = classRows[0];

            const { rows: teacherRows } = await db.query(`
              SELECT DISTINCT u.id as user_id, p.prenom, p.nom, m.nom as matiere_nom
              FROM (
                SELECT classe_id, professeur_id, matiere_id FROM professeur_matieres
                UNION
                SELECT classe_id, professeur_id, matiere_id FROM emplois_du_temps
              ) pm
              JOIN classes c1 ON pm.classe_id = c1.id
              JOIN classes c2 ON c1.nom = c2.nom AND c1.etablissement_id = c2.etablissement_id
              JOIN users u ON pm.professeur_id = u.id
              LEFT JOIN professeurs p ON p.id = u.id
              LEFT JOIN matieres m ON pm.matiere_id = m.id
              WHERE c2.id IN (
                SELECT ic.classe_id FROM inscription_classes ic WHERE ic.eleve_id = $1
              )
              ORDER BY p.nom, p.prenom
            `, [student.id]);

            teachers = teacherRows;
          }
        }

        return res.json({ admin: adminDetails, classe, teachers });
      }
      return res.json({});
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors du chargement des canaux.', 500);
    }
  },

  async getChannelHistory(req, res, next) {
    const { etablissement_id, type, target_id } = req.query;
    try {
      let messages = [];
      if (type === 'ADMIN') {
        // Chat between teacher/student and establishment admin
        const etabId = etablissement_id;
        const etabRes = await db.query('SELECT admin_id FROM etablissements WHERE id = $1', [etabId]);
        if (etabRes.rows.length > 0) {
          const adminUserId = etabRes.rows[0].admin_id;
          messages = await MessageModel.getDirectChatHistory(etabId, req.user.id, adminUserId);
          // Mark received messages as read
          await MessageModel.markMessagesAsRead(adminUserId, req.user.id, etabId);
        }
      } else if (type === 'CLASSE') {
        messages = await MessageModel.getClassGroupChatHistory(target_id);
        await MessageModel.markClassMessagesAsRead(target_id, req.user.id);
      } else if (type === 'OFFICE_BAC') {
        messages = await MessageModel.getOfficeBacChatHistory(req.user.id);
      } else if (type === 'PROFESSEUR' || type === 'ELEVE') {
        let etabId = etablissement_id;
        if (!etabId) {
          const etabRes = await db.query('SELECT etablissement_id FROM eleves WHERE user_id = $1', [req.user.id]);
          etabId = etabRes.rows[0]?.etablissement_id;
        }
        if (!etabId) {
          etabId = await MessageModel.getEtablissementIdByAdminId(req.user.id);
        }
        messages = await MessageModel.getDirectChatHistory(etabId, req.user.id, target_id);
        await MessageModel.markMessagesAsRead(target_id, req.user.id, etabId);
      }
      return res.json(messages);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors du chargement de l\'historique.', 500);
    }
  }
};

module.exports = messageController;
