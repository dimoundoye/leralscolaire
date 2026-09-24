const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const ProfModel = require('../models/profModel');
const db = require('../config/db'); // For transaction connection
const response = require('../utils/response');
const { generateIUP } = require('../utils/iupGenerator');
const emailService = require('../services/emailService');

const profController = {
  async listProfesseurs(req, res, next) {
    try {
      const etablissementId = await ProfModel.getEtablissementIdByAdminId(req.user.id);
      if (!etablissementId) {
        return response.error(res, 'Établissement non trouvé.', 404);
      }
      const profs = await ProfModel.listProfesseurs(etablissementId);
      return res.json(profs);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la récupération des professeurs.', 500);
    }
  },

  async createProfesseur(req, res, next) {
    const { email, password } = req.body;
    try {
      const etab = await ProfModel.getEtablissementByAdminId(req.user.id);
      if (!etab) {
        return response.error(res, "Seul l'admin peut créer un prof.", 404);
      }
      const etablissementId = etab.id;
      const etabRegion = etab.region || 'Dakar';

      const userExists = await ProfModel.checkUserExists(email);
      if (userExists) {
        return response.error(res, 'Cet email est déjà utilisé.', 400);
      }

      const client = await db.pool.connect();
      try {
        await client.query('BEGIN');

        // Générer IUP Enseignant officiel (ex: ENS-2026-DKR-0001)
        const identifiant_national = await generateIUP('ENS', etabRegion, null, client);

        // Générer mot de passe temporaire si non fourni
        const tempPassword = password || crypto.randomBytes(4).toString('hex');
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(tempPassword, salt);

        const profId = await ProfModel.createProfUser(email, passwordHash, identifiant_national, tempPassword, client);
        await ProfModel.linkProfToEtablissement(profId, etablissementId, client);

        await client.query('COMMIT');

        // Envoi automatique de l'email avec identifiant et mot de passe provisoire (non-bloquant)
        emailService.sendProfesseurWelcome({
          to: email,
          nom: '',
          prenom: '',
          iupProf: identifiant_national,
          tempPassword: tempPassword,
          nomEtablissement: etab.nom
        }).catch(e => console.error('Erreur email professeur:', e.message));

        return res.status(201).json({
          message: 'Professeur créé avec succès ! Identifiants envoyés par email.',
          id: profId,
          identifiant: identifiant_national,
          password: tempPassword
        });
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la création du professeur.', 500);
    }
  },

  async updateProfesseur(req, res, next) {
    const { email, password } = req.body;
    try {
      const etablissementId = await ProfModel.getEtablissementIdByAdminId(req.user.id);
      if (!etablissementId) {
        return response.error(res, 'Établissement non trouvé.', 404);
      }
      // Seul un compte PROFESSEUR rattaché à l'établissement de l'administrateur peut être modifié
      const { rows: cible } = await db.query(
        `SELECT 1 FROM users u
         JOIN professeurs_etablissements pe ON pe.professeur_id = u.id
         WHERE u.id = $1 AND u.role = 'PROFESSEUR' AND pe.etablissement_id = $2 AND pe.statut = 'ACCEPTE'`,
        [req.params.id, etablissementId]
      );
      if (cible.length === 0) {
        return response.error(res, 'Accès refusé. Ce professeur n\'est pas rattaché à votre établissement.', 403);
      }

      let passwordHash = null;
      if (password) {
        const salt = await bcrypt.genSalt(10);
        passwordHash = await bcrypt.hash(password, salt);
      }

      const updatedProf = await ProfModel.updateProfUser(req.params.id, email, passwordHash);
      return res.json(updatedProf);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la modification du professeur.', 500);
    }
  },

  async deleteProfesseur(req, res, next) {
    try {
      const etablissementId = await ProfModel.getEtablissementIdByAdminId(req.user.id);
      if (!etablissementId) {
        return response.error(res, 'Établissement non trouvé.', 404);
      }

      await ProfModel.unlinkProfFromEtablissement(req.params.id, etablissementId);
      return res.json({ message: "Professeur retiré de l'établissement." });
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la suppression.', 500);
    }
  },

  async searchProfesseur(req, res) {
    const { identifiant } = req.params;
    try {
      const prof = await ProfModel.findProfByIdentifiant(identifiant);
      if (!prof) {
        return response.error(res, 'Aucun enseignant trouvé avec cet identifiant national.', 404);
      }
      return res.json(prof);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la recherche du professeur.', 500);
    }
  },

  async inviteProfesseur(req, res) {
    const { professeur_id } = req.body;
    try {
      const etablissementId = await ProfModel.getEtablissementIdByAdminId(req.user.id);
      if (!etablissementId) {
        return response.error(res, 'Établissement non trouvé.', 404);
      }

      await ProfModel.linkProfToEtablissement(professeur_id, etablissementId);
      return res.json({ message: "Invitation envoyée avec succès ! L'enseignant doit maintenant l'accepter depuis son espace." });
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de l\'envoi de l\'invitation.', 500);
    }
  },

  async listAssignments(req, res) {
    const { id: professeur_id } = req.params;
    try {
      const etablissementId = await ProfModel.getEtablissementIdByAdminId(req.user.id);
      if (!etablissementId) {
        return response.error(res, 'Établissement non trouvé.', 404);
      }

      const { rows } = await db.query(
        `SELECT pm.id, pm.classe_id, pm.matiere_id, c.nom as classe_nom, c.annee_scolaire, m.nom as matiere_nom
         FROM professeur_matieres pm
         JOIN classes c ON pm.classe_id = c.id
         JOIN matieres m ON pm.matiere_id = m.id
         WHERE pm.professeur_id = $1 AND c.etablissement_id = $2
         ORDER BY c.annee_scolaire DESC, c.nom ASC, m.nom ASC`,
        [professeur_id, etablissementId]
      );
      return res.json(rows);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la récupération des affectations.', 500);
    }
  },

  async createAssignment(req, res) {
    const { professeur_id, classe_id, matiere_id } = req.body;
    try {
      // La classe doit appartenir à l'établissement et le professeur y être rattaché
      const etablissementId = await ProfModel.getEtablissementIdByAdminId(req.user.id);
      const { rows: valid } = await db.query(
        `SELECT 1 FROM classes c
         JOIN professeurs_etablissements pe
           ON pe.etablissement_id = c.etablissement_id AND pe.professeur_id = $2 AND pe.statut = 'ACCEPTE'
         WHERE c.id = $1 AND c.etablissement_id = $3`,
        [classe_id, professeur_id, etablissementId]
      );
      if (!etablissementId || valid.length === 0) {
        return response.error(res, 'Accès refusé. Classe ou professeur hors de votre établissement.', 403);
      }

      const { rows } = await db.query(
        `INSERT INTO professeur_matieres (professeur_id, classe_id, matiere_id)
         VALUES ($1, $2, $3)
         ON CONFLICT (professeur_id, matiere_id, classe_id) DO NOTHING
         RETURNING *`,
        [professeur_id, classe_id, matiere_id]
      );
      return res.status(201).json({ message: 'Affectation créée avec succès !', assignment: rows[0] });
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la création de l\'affectation.', 500);
    }
  },

  async deleteAssignment(req, res) {
    const { id } = req.params;
    try {
      const etablissementId = await ProfModel.getEtablissementIdByAdminId(req.user.id);
      const { rowCount } = await db.query(
        `DELETE FROM professeur_matieres pm
         USING classes c
         WHERE pm.id = $1 AND pm.classe_id = c.id AND c.etablissement_id = $2`,
        [id, etablissementId]
      );
      if (rowCount === 0) {
        return response.error(res, 'Affectation introuvable dans votre établissement.', 404);
      }
      return res.json({ message: 'Affectation retirée avec succès.' });
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors du retrait de l\'affectation.', 500);
    }
  },

  async toggleMessagePermission(req, res) {
    const { id: profId } = req.params;
    const { droit_envoi_message } = req.body;
    try {
      const etablissementId = await ProfModel.getEtablissementIdByAdminId(req.user.id);
      if (!etablissementId) {
        return response.error(res, 'Établissement non trouvé.', 404);
      }
      await ProfModel.toggleMessagePermission(profId, etablissementId, droit_envoi_message);
      return res.json({ message: droit_envoi_message ? 'Permission accordée.' : 'Permission révoquée.' });
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la mise à jour de la permission.', 500);
    }
  }
};


module.exports = profController;
