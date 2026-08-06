const bcrypt = require('bcryptjs');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const StudentModel = require('../models/studentModel');
const db = require('../config/db'); // For transaction connection
const response = require('../utils/response');

// Helper to generate provisional temp password
function generateTempPassword() {
  return crypto.randomBytes(4).toString('hex'); // 8 characters
}

// Helper to generate Unique National Student ID
async function generateStudentId() {
  const year = new Date().getFullYear();
  const letters = Array.from({ length: 3 }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26))
  ).join('');
  const count = await StudentModel.countStudents();
  const sequence = (count + 1).toString().padStart(6, '0');
  return `SN-${year}-${letters}-${sequence}`;
}

const studentController = {
  /**
   * List all students for current school
   */
  async listStudents(req, res, next) {
    try {
      const etablissementId = await StudentModel.getEtablissementIdByAdminId(req.user.id);
      if (!etablissementId) {
        return response.error(res, 'Établissement non trouvé.', 404);
      }
      const eleves = await StudentModel.listStudents(etablissementId);
      return res.json(eleves); // Direct JSON array response for compatibility
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur serveur.', 500);
    }
  },

  /**
   * Enroll a student (with photo upload)
   */
  async enrollStudent(req, res, next) {
    const {
      nom, prenom, sexe, date_naissance, lieu_naissance, nationalite,
      telephone, coordonnees_parent, classe_id, statut
    } = req.body;

    const photo_url = req.files?.photo?.[0] ? `/uploads/photos/${req.files.photo[0].filename}` : null;
    const justificatif_inapte_url = req.files?.justificatif_inapte?.[0] ? `/uploads/justificatifs_inapte/${req.files.justificatif_inapte[0].filename}` : null;

    // Validation : si statut INAPTE, le justificatif est obligatoire
    if ((statut === 'INAPTE') && !justificatif_inapte_url) {
      return response.error(res, 'Un justificatif (PDF ou image) est obligatoire pour déclarer un élève Inapte.', 400);
    }

    try {
      const etablissementId = await StudentModel.getEtablissementIdByAdminId(req.user.id);
      if (!etablissementId) {
        return response.error(res, 'Établissement non trouvé.', 404);
      }

      const identifiant_national = await generateStudentId();
      const tempPassword = generateTempPassword();
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(tempPassword, salt);

      const email = `${identifiant_national.toLowerCase()}@lernalscolaire.sn`;

      // Use a database transaction
      const client = await db.pool.connect();
      try {
        await client.query('BEGIN');

        // Create associated User account (Role: ELEVE)
        const user = await StudentModel.createUser(email, identifiant_national, passwordHash, tempPassword, 'ELEVE', client);
        const userId = user.id;

        // Create Student profile
        const eleve = await StudentModel.createStudent({
          identifiant_national,
          user_id: userId,
          etablissement_id: etablissementId,
          nom,
          prenom,
          sexe: sexe || 'M',
          date_naissance,
          lieu_naissance,
          nationalite,
          telephone,
          coordonnees_parent,
          photo_url,
          justificatif_inapte_url,
          statut: statut || 'APTE'
        }, client);

        const eleveId = eleve.id;

        // Inscribe student to class if provided
        if (classe_id) {
          await StudentModel.addInscriptionClass(eleveId, classe_id, client);
        }

        await client.query('COMMIT');

        return res.status(201).json({
          message: 'Élève inscrit avec succès !',
          identifiant: identifiant_national,
          password: tempPassword,
          eleve
        });
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      console.error(err);
      return response.error(res, "Erreur lors de l'inscription.", 500);
    }
  },

  /**
   * Import students from Excel sheet
   */
  async importStudents(req, res, next) {
    if (!req.file) return response.error(res, 'Aucun fichier fourni.', 400);

    try {
      const etablissementId = await StudentModel.getEtablissementIdByAdminId(req.user.id);
      const workbook = XLSX.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      const importedEleves = [];

      for (const row of data) {
        const { nom, prenom, sexe, civilite, date_naissance, lieu_naissance, nationalite, telephone, classe_nom } = row;
        const rawSexe = String(sexe || civilite || '').toUpperCase().trim();
        const sexeVal = (rawSexe === 'F' || rawSexe.startsWith('FEM') || rawSexe.includes('MME') || rawSexe.includes('MLLE')) ? 'F' : 'M';
        const identifiant_national = await generateStudentId();
        const tempPassword = generateTempPassword();
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(tempPassword, salt);
        const email = `${identifiant_national.toLowerCase()}@lernalscolaire.sn`;

        // Use transaction for each row insertion to ensure consistency
        const client = await db.pool.connect();
        try {
          await client.query('BEGIN');

          const user = await StudentModel.createUser(email, identifiant_national, passwordHash, tempPassword, 'ELEVE', client);
          const userId = user.id;

          const eleve = await StudentModel.createStudent({
            identifiant_national,
            user_id: userId,
            etablissement_id: etablissementId,
            nom,
            prenom,
            sexe: sexeVal,
            date_naissance,
            lieu_naissance,
            nationalite,
            telephone
          }, client);

          if (classe_nom) {
            const classId = await StudentModel.getEtablissementClassByName(classe_nom, etablissementId);
            if (classId) {
              await StudentModel.addInscriptionClass(eleve.id, classId, client);
            }
          }

          await client.query('COMMIT');
          importedEleves.push({ identifiant: identifiant_national, password: tempPassword, nom, prenom });
        } catch (err) {
          await client.query('ROLLBACK');
          throw err;
        } finally {
          client.release();
        }
      }

      fs.unlinkSync(req.file.path);
      return res.json({ message: `${importedEleves.length} élèves importés.`, eleves: importedEleves });
    } catch (err) {
      console.error(err);
      if (req.file) fs.unlinkSync(req.file.path);
      return response.error(res, "Erreur lors de l'importation.", 500);
    }
  },

  /**
   * Export students list to Excel
   */
  async exportStudents(req, res, next) {
    const { classe_id } = req.query;
    try {
      const etablissementId = await StudentModel.getEtablissementIdByAdminId(req.user.id);
      if (!etablissementId) {
        return response.error(res, 'Établissement non trouvé.', 404);
      }

      const rows = await StudentModel.getExportStudents(etablissementId, classe_id);
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Eleves');

      const exportsDir = path.join(__dirname, '../../exports');
      if (!fs.existsSync(exportsDir)) {
        fs.mkdirSync(exportsDir, { recursive: true });
      }

      const filePath = path.join(exportsDir, `eleves_${etablissementId}.xlsx`);
      XLSX.writeFile(workbook, filePath);

      return res.download(filePath, 'liste_eleves.xlsx', () => {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error('Error removing export file:', err);
        }
      });
    } catch (err) {
      console.error(err);
      return response.error(res, "Erreur lors de l'exportation.", 500);
    }
  },

  /**
   * Update student details (with optional photo)
   */
  async updateStudent(req, res, next) {
    const { nom, prenom, sexe, date_naissance, lieu_naissance, nationalite, telephone, coordonnees_parent, statut, classe_id } = req.body;
    const photo_url = req.files?.photo?.[0] ? `/uploads/photos/${req.files.photo[0].filename}` : undefined;
    const justificatif_inapte_url = req.files?.justificatif_inapte?.[0] ? `/uploads/justificatifs_inapte/${req.files.justificatif_inapte[0].filename}` : undefined;

    // Validation : si statut INAPTE, le justificatif est obligatoire
    const currentStudent = await StudentModel.getStudentById(req.params.id);
    const newStatut = statut || currentStudent?.statut;
    if (newStatut === 'INAPTE' && !justificatif_inapte_url && !currentStudent?.justificatif_inapte_url) {
      return response.error(res, 'Un justificatif (PDF ou image) est obligatoire pour déclarer un élève Inapte.', 400);
    }

    try {
      const adminEtablissementId = await StudentModel.getEtablissementIdByAdminId(req.user.id);
      const student = await StudentModel.getStudentById(req.params.id);
      if (!student) {
        return response.error(res, 'Élève non trouvé.', 404);
      }
      if (student.etablissement_id !== adminEtablissementId) {
        return response.error(res, "Accès refusé. Vous n'avez plus les droits d'édition sur cet élève (élève transféré).", 403);
      }

      const updatedStudent = await StudentModel.updateStudent(req.params.id, {
        nom, prenom, sexe, date_naissance, lieu_naissance, nationalite, telephone, coordonnees_parent, statut
      }, photo_url, justificatif_inapte_url);

      if (classe_id) {
        await StudentModel.clearStudentClassEnrollments(req.params.id);
        await StudentModel.addInscriptionClass(req.params.id, classe_id);
      }

      return res.json(updatedStudent);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la modification.', 500);
    }
  },

  /**
   * Directly assign student to a class
   */
  async assignClass(req, res, next) {
    const { id } = req.params;
    const { classe_id } = req.body;
    if (!classe_id) {
      return response.error(res, 'Veuillez sélectionner une classe.', 400);
    }
    try {
      const adminEtablissementId = await StudentModel.getEtablissementIdByAdminId(req.user.id);
      const student = await StudentModel.getStudentById(id);
      if (!student) {
        return response.error(res, 'Élève non trouvé.', 404);
      }
      if (student.etablissement_id !== adminEtablissementId) {
        return response.error(res, "Accès refusé. Cet élève n'appartient pas à votre établissement.", 403);
      }

      await StudentModel.clearStudentClassEnrollments(id);
      await StudentModel.addInscriptionClass(id, classe_id);

      return res.json({ message: 'Élève affecté à la classe avec succès !' });
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de l\'affectation.', 500);
    }
  },

  /**
   * Delete student (and user profile)
   */
  async deleteStudent(req, res, next) {
    try {
      const adminEtablissementId = await StudentModel.getEtablissementIdByAdminId(req.user.id);
      const student = await StudentModel.getStudentById(req.params.id);
      if (!student) {
        return response.error(res, 'Élève non trouvé.', 404);
      }
      if (student.etablissement_id !== adminEtablissementId) {
        return response.error(res, "Accès refusé. Vous n'avez pas le droit de supprimer cet élève.", 403);
      }

      const userId = await StudentModel.getStudentUserId(req.params.id);
      if (userId) {
        await StudentModel.deleteUser(userId);
      }
      await StudentModel.deleteStudent(req.params.id);
      return res.json({ message: 'Élève supprimé.' });
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la suppression.', 500);
    }
  },

  /**
   * Transfer single student to another Etablissement (creates EN_ATTENTE request)
   */
  async transferStudent(req, res, next) {
    const { nouveau_etablissement_id, motif } = req.body;
    try {
      const adminEtablissementId = await StudentModel.getEtablissementIdByAdminId(req.user.id);
      const student = await StudentModel.getStudentById(req.params.id);
      if (!student) {
        return response.error(res, 'Élève non trouvé.', 404);
      }
      if (student.etablissement_id !== adminEtablissementId) {
        return response.error(res, "Accès refusé. Cet élève n'appartient pas à votre établissement.", 403);
      }

      await StudentModel.createTransferRecord(req.params.id, adminEtablissementId, nouveau_etablissement_id, motif);

      return res.json({ message: 'Demande de transfert envoyée avec succès. Vous conservez les droits d\'édition jusqu\'à la validation par l\'établissement d\'accueil.' });
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la demande de transfert.', 500);
    }
  },

  /**
   * Bulk Transfer students to another Etablissement
   */
  async bulkTransferStudents(req, res, next) {
    const { eleve_ids, nouveau_etablissement_id, motif } = req.body;
    if (!Array.isArray(eleve_ids) || eleve_ids.length === 0) {
      return response.error(res, 'Veuillez sélectionner au moins un élève.', 400);
    }
    if (!nouveau_etablissement_id) {
      return response.error(res, 'Veuillez sélectionner l\'établissement destinataire.', 400);
    }

    try {
      const adminEtablissementId = await StudentModel.getEtablissementIdByAdminId(req.user.id);

      // Verify ownership for all requested students
      for (const eleveId of eleve_ids) {
        const student = await StudentModel.getStudentById(eleveId);
        if (!student || student.etablissement_id !== adminEtablissementId) {
          return response.error(res, `Un ou plusieurs élèves n'appartiennent pas à votre établissement.`, 403);
        }
      }

      const client = await db.pool.connect();
      try {
        await client.query('BEGIN');
        await StudentModel.createPendingTransfersBulk(eleve_ids, adminEtablissementId, nouveau_etablissement_id, motif, client);
        await client.query('COMMIT');

        return res.json({ message: `${eleve_ids.length} demande(s) de transfert envoyée(s) avec succès. Vos droits d'édition sont conservés jusqu'à la validation.` });
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors du transfert groupé.', 500);
    }
  },

  /**
   * List incoming pending transfer requests for current school
   */
  async listIncomingTransfers(req, res, next) {
    try {
      const etablissementId = await StudentModel.getEtablissementIdByAdminId(req.user.id);
      if (!etablissementId) return response.error(res, 'Établissement non trouvé.', 404);
      const incoming = await StudentModel.getIncomingTransfers(etablissementId);
      return res.json(incoming);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur serveur.', 500);
    }
  },

  /**
   * List outgoing transfer requests for current school
   */
  async listOutgoingTransfers(req, res, next) {
    try {
      const etablissementId = await StudentModel.getEtablissementIdByAdminId(req.user.id);
      if (!etablissementId) return response.error(res, 'Établissement non trouvé.', 404);
      const outgoing = await StudentModel.getOutgoingTransfers(etablissementId);
      return res.json(outgoing);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur serveur.', 500);
    }
  },

  /**
   * Accept an incoming transfer request
   */
  async acceptTransfer(req, res, next) {
    const { id } = req.params;
    try {
      const etablissementId = await StudentModel.getEtablissementIdByAdminId(req.user.id);
      const client = await db.pool.connect();
      try {
        await client.query('BEGIN');
        await StudentModel.acceptTransfer(id, etablissementId, client);
        await client.query('COMMIT');

        return res.json({ message: 'Transfert accepté avec succès ! Les droits d\'édition vous ont été transmis.' });
      } catch (err) {
        await client.query('ROLLBACK');
        return response.error(res, err.message || 'Erreur lors de l\'acceptation.', 400);
      } finally {
        client.release();
      }
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur serveur.', 500);
    }
  },

  /**
   * Reject an incoming transfer request
   */
  async rejectTransfer(req, res, next) {
    const { id } = req.params;
    try {
      const etablissementId = await StudentModel.getEtablissementIdByAdminId(req.user.id);
      await StudentModel.rejectTransfer(id, etablissementId);
      return res.json({ message: 'Demande de transfert refusée.' });
    } catch (err) {
      console.error(err);
      return response.error(res, err.message || 'Erreur lors du refus.', 400);
    }
  },

  /**
   * Cancel an outgoing pending transfer request
   */
  async cancelTransfer(req, res, next) {
    const { id } = req.params;
    try {
      const etablissementId = await StudentModel.getEtablissementIdByAdminId(req.user.id);
      const success = await StudentModel.cancelTransfer(id, etablissementId);
      if (!success) {
        return response.error(res, 'Demande introuvable ou déjà traitée.', 400);
      }
      return res.json({ message: 'Demande de transfert annulée avec succès.' });
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur serveur.', 500);
    }
  }
};

module.exports = studentController;
