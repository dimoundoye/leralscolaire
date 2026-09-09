const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const PreInscriptionModel = require('../models/preInscriptionModel');
const db = require('../config/db'); // For pool transactions
const response = require('../utils/response');
const { generateIUP } = require('../utils/iupGenerator');
const emailService = require('../services/emailService');

function generateTempPassword() {
  return crypto.randomBytes(4).toString('hex'); // 8 characters
}

async function generateStudentId(region = 'Dakar', year = null, client = db) {
  return await generateIUP('SN', region, year, client);
}

const preInscriptionController = {
  /**
   * PUBLIC: Get details of a class for pre-inscription form
   */
  async getPublicClassDetails(req, res, next) {
    const { classId } = req.params;
    try {
      const classDetails = await PreInscriptionModel.getPublicClassDetails(classId);
      if (!classDetails) {
        return response.error(res, 'Classe non trouvée.', 404);
      }
      return res.json(classDetails);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur serveur.', 500);
    }
  },

  /**
   * PUBLIC: Submit inscription / transfer demand
   */
  async submitPreInscription(req, res, next) {
    const {
      nom, prenom, sexe, date_naissance, lieu_naissance, nationalite,
      telephone, coordonnees_parent, classe_id, etablissement_id, statut,
      identifiant_existant, email
    } = req.body;

    if (!telephone || !String(telephone).trim()) {
      return response.error(res, 'Le numéro de téléphone est obligatoire.', 400);
    }
    const cleanEmail = email ? String(email).trim() : null;
    if (!cleanEmail) {
      return response.error(res, "L'adresse email (de l'élève ou du parent/tuteur) est obligatoire pour l'envoi des identifiants.", 400);
    }

const { getUploadedFileUrl } = require('../config/cloudinary');

    const photo_url = req.file ? getUploadedFileUrl(req.file, 'photos') : null;

    try {
      // If it's a transfer, verify the student exists in the database
      if (identifiant_existant) {
        const student = await PreInscriptionModel.checkStudentExists(identifiant_existant);
        if (!student) {
          return response.error(res, "L'identifiant national fourni n'existe pas. Veuillez vérifier votre saisie.", 404);
        }
      }

      const preInscription = await PreInscriptionModel.createPreInscription({
        classe_id, etablissement_id, nom, prenom, sexe: sexe || 'M', date_naissance,
        lieu_naissance, nationalite, telephone: telephone.trim(), coordonnees_parent, statut,
        identifiant_existant, photo_url, email: cleanEmail
      });

      return res.status(201).json({
        message: 'Votre demande a été soumise avec succès ! L\'établissement va l\'examiner.',
        preInscription
      });
    } catch (err) {
      console.error(err);
      return response.error(res, "Erreur lors de la soumission de l'inscription.", 500);
    }
  },

  /**
   * ADMIN: List pending pre-inscriptions
   */
  async listPending(req, res, next) {
    try {
      const etablissementId = await PreInscriptionModel.getEtablissementIdByAdminId(req.user.id);
      if (!etablissementId) {
        return response.error(res, 'Établissement non trouvé.', 404);
      }

      const list = await PreInscriptionModel.getPendingPreInscriptions(etablissementId);
      return res.json(list);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur serveur.', 500);
    }
  },

  /**
   * ADMIN: Modify pending pre-inscription fields
   */
  async updatePreInscription(req, res, next) {
    const { id } = req.params;
    const {
      nom, prenom, sexe, date_naissance, lieu_naissance, nationalite,
      telephone, coordonnees_parent, statut, identifiant_existant, email
    } = req.body;

    try {
      const preInscription = await PreInscriptionModel.updatePreInscription(id, {
        nom, prenom, sexe, date_naissance, lieu_naissance,
        nationalite, telephone, coordonnees_parent, statut, identifiant_existant, email
      });

      if (!preInscription) {
        return response.error(res, 'Pré-inscription non trouvée.', 404);
      }

      return res.json({ message: 'Demande mise à jour.', preInscription });
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur serveur.', 500);
    }
  },

  /**
   * ADMIN: Validate a pre-inscription (creates account or handles transfer)
   */
  async validatePreInscription(req, res, next) {
    const { id } = req.params;
    const { email: overrideEmail } = req.body || {};

    try {
      const pre = await PreInscriptionModel.getPreInscriptionById(id);
      if (!pre) {
        return response.error(res, 'Pré-inscription non trouvée.', 404);
      }

      if (pre.statut_validation !== 'EN_ATTENTE') {
        return response.error(res, 'Cette pré-inscription a déjà été traitée.', 400);
      }

      const client = await db.pool.connect();
      try {
        await client.query('BEGIN');

        // Email effectif (avec possibilité de correction/surcharge transmise)
        const effectiveEmail = overrideEmail !== undefined 
          ? (overrideEmail ? overrideEmail.trim().toLowerCase() : null)
          : (pre.email ? pre.email.trim().toLowerCase() : null);

        if (pre.identifiant_existant) {
          // --- EXISTING STUDENT TRANSFER ---
          const student = await PreInscriptionModel.getStudentByNationalId(pre.identifiant_existant, client);
          if (!student) {
            throw new Error("L'élève avec cet identifiant national n'existe plus.");
          }

          const eleveId = student.id;

          // Update student info with pre-inscription data
          await PreInscriptionModel.updateStudentProfile(eleveId, {
            etablissement_id: pre.etablissement_id,
            nom: pre.nom,
            prenom: pre.prenom,
            sexe: pre.sexe || 'M',
            date_naissance: pre.date_naissance,
            lieu_naissance: pre.lieu_naissance,
            nationalite: pre.nationalite,
            telephone: pre.telephone,
            coordonnees_parent: pre.coordonnees_parent,
            statut: pre.statut,
            photo_url: pre.photo_url,
            email: effectiveEmail || null
          }, client);

          // Enroll in the new class
          await PreInscriptionModel.addInscriptionClass(eleveId, pre.classe_id, client);

          // Validate pre-inscription record
          await PreInscriptionModel.setValidationStatus(id, 'VALIDE', client);

          await client.query('COMMIT');

          return res.json({
            message: 'Transfert validé avec succès ! L\'élève a été affecté à l\'établissement et à sa nouvelle classe.',
            transfer: true,
            credentials: {
              identifiant: pre.identifiant_existant,
              password: 'Conserve son mot de passe existant'
            }
          });
        } else {
          // --- NEW STUDENT INSCRIPTION ---

          // Vérification explicite des doublons d'email avant création
          if (effectiveEmail) {
            const existingEmailUser = await client.query(
              'SELECT id, email, role, identifiant_national FROM users WHERE LOWER(email) = LOWER($1)',
              [effectiveEmail]
            );
            if (existingEmailUser.rows.length > 0) {
              await client.query('ROLLBACK');
              client.release();
              return res.status(409).json({
                error: 'EMAIL_DUPLICATE',
                email: effectiveEmail,
                eleveNom: `${pre.prenom || ''} ${pre.nom || ''}`.trim(),
                preInscriptionId: id,
                message: `L'adresse email "${effectiveEmail}" est déjà enregistrée dans le système LéralScolaire.`
              });
            }

            // Si un nouvel email corrigé a été transmis, on met à jour la pré-inscription
            if (overrideEmail !== undefined && overrideEmail !== pre.email) {
              await client.query('UPDATE pre_inscriptions SET email = $1 WHERE id = $2', [effectiveEmail, id]);
              pre.email = effectiveEmail;
            }
          }

          const region = pre.etablissement_region || 'Dakar';
          const identifiant_national = await generateStudentId(region, null, client);
          const tempPassword = generateTempPassword();
          const salt = await bcrypt.genSalt(10);
          const passwordHash = await bcrypt.hash(tempPassword, salt);

          // 1. Create User account (Role: ELEVE)
          const user = await PreInscriptionModel.createUser(effectiveEmail || null, identifiant_national, passwordHash, tempPassword, 'ELEVE', client);
          const userId = user.id;

          // 2. Create student record
          const eleveId = await PreInscriptionModel.createStudent({
            identifiant_national,
            user_id: userId,
            etablissement_id: pre.etablissement_id,
            nom: pre.nom,
            prenom: pre.prenom,
            sexe: pre.sexe || 'M',
            date_naissance: pre.date_naissance,
            lieu_naissance: pre.lieu_naissance,
            nationalite: pre.nationalite,
            telephone: pre.telephone,
            coordonnees_parent: pre.coordonnees_parent,
            statut: pre.statut,
            photo_url: pre.photo_url,
            email: effectiveEmail || null
          }, client);

          // 3. Enroll in class
          await PreInscriptionModel.addInscriptionClass(eleveId, pre.classe_id, client);

          // 4. Mark pre-inscription as validated
          await PreInscriptionModel.setValidationStatus(id, 'VALIDE', client);

          await client.query('COMMIT');

          // Envoi automatique de l'email avec l'IUP et le mot de passe temporaire (non-bloquant)
          if (effectiveEmail) {
            emailService.sendEleveWelcome({
              to: effectiveEmail,
              nom: pre.nom,
              prenom: pre.prenom,
              iupEleve: identifiant_national,
              tempPassword: tempPassword,
              nomEtablissement: pre.etablissement_nom,
              classeNom: pre.classe_nom,
              isParent: false
            }).catch(e => console.error('Erreur email élève pré-inscription:', e.message));
          }

          return res.json({
            message: 'Inscription validée avec succès ! Compte élève créé et identifiants envoyés par email.',
            transfer: false,
            credentials: {
              identifiant: identifiant_national,
              password: tempPassword,
              email: effectiveEmail
            }
          });
        }
      } catch (err) {
        await client.query('ROLLBACK');
        if (err.code === '23505' && (err.constraint === 'users_email_key' || err.detail?.includes('email'))) {
          client.release();
          return res.status(409).json({
            error: 'EMAIL_DUPLICATE',
            email: pre.email,
            eleveNom: `${pre.prenom || ''} ${pre.nom || ''}`.trim(),
            preInscriptionId: id,
            message: `L'adresse email "${pre.email}" est déjà associée à un compte dans le système LéralScolaire.`
          });
        }
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la validation.', 500);
    }
  },

  /**
   * ADMIN: Reject a pre-inscription
   */
  async rejectPreInscription(req, res, next) {
    const { id } = req.params;
    try {
      const pre = await PreInscriptionModel.getPreInscriptionById(id);
      if (!pre) {
        return response.error(res, 'Pré-inscription non trouvée.', 404);
      }

      await PreInscriptionModel.setValidationStatus(id, 'REJETE');
      return res.json({ message: "Demande d'inscription rejetée." });
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur serveur.', 500);
    }
  }
};

module.exports = preInscriptionController;
