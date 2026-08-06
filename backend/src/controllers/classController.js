const ClassModel = require('../models/classModel');
const ProfModel = require('../models/profModel');
const response = require('../utils/response');
const db = require('../config/db');

function getNextAcademicYear(currentYear) {
  const parts = (currentYear || '').split('-');
  if (parts.length === 2) {
    const start = parseInt(parts[0]);
    const end = parseInt(parts[1]);
    if (!isNaN(start) && !isNaN(end)) {
      return `${start + 1}-${end + 1}`;
    }
  }
  return currentYear;
}

async function autoCloneClassesForEtablissement(etablissementId) {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    
    // Get the OLDEST year — use it as the reference/template for cloning
    const yearsRes = await client.query(`
      SELECT DISTINCT annee_scolaire FROM classes 
      WHERE etablissement_id = $1
      ORDER BY annee_scolaire ASC
      LIMIT 1
    `, [etablissementId]);
    
    if (yearsRes.rows.length === 0) {
      await client.query('COMMIT');
      return;
    }

    const baseYear = yearsRes.rows[0].annee_scolaire;
    const nextY = getNextAcademicYear(baseYear);

    // Safety cap: never clone more than 1 year ahead of current real-world year
    const currentCalendarYear = new Date().getFullYear();
    const nextYearStart = parseInt((nextY || '').split('-')[0]);
    if (!isNaN(nextYearStart) && nextYearStart > currentCalendarYear + 1) {
      await client.query('COMMIT');
      return;
    }

    // Get all classes from the base year
    const classesToClone = await client.query(`
      SELECT id, nom, niveau FROM classes 
      WHERE etablissement_id = $1 AND annee_scolaire = $2
    `, [etablissementId, baseYear]);
    
    // For each class, check individually if a class with the same name already exists in nextY
    // This prevents duplicates when saveDecisions already created some classes for nextY
    for (const c of classesToClone.rows) {
      const existsRes = await client.query(`
        SELECT id FROM classes 
        WHERE etablissement_id = $1 AND annee_scolaire = $2 AND nom = $3
        LIMIT 1
      `, [etablissementId, nextY, c.nom]);
      
      if (existsRes.rows.length === 0) {
        const insertRes = await client.query(`
          INSERT INTO classes (nom, niveau, etablissement_id, annee_scolaire)
          VALUES ($1, $2, $3, $4)
          RETURNING id
        `, [c.nom, c.niveau, etablissementId, nextY]);
        
        if (insertRes.rows.length > 0) {
          const newClassId = insertRes.rows[0].id;
          // Copy matieres/coefficients only (no students)
          await client.query(`
            INSERT INTO classe_matieres (classe_id, matiere_id, coefficient)
            SELECT $1, matiere_id, coefficient 
            FROM classe_matieres 
            WHERE classe_id = $2
            ON CONFLICT DO NOTHING
          `, [newClassId, c.id]);
        }
      }
    }
    
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error cloning classes:', err);
  } finally {
    client.release();
  }
}

const classController = {
  async listClasses(req, res, next) {
    try {
      const etablissementId = await ClassModel.getEtablissementIdByAdminId(req.user.id);
      if (!etablissementId) {
        return response.error(res, 'Établissement non trouvé.', 404);
      }
      
      // Automatically clone classes to next year if not done yet
      await autoCloneClassesForEtablissement(etablissementId);
      
      const classes = await ClassModel.listClasses(etablissementId);
      return res.json(classes); // keeps compatibility with direct array response
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur serveur.', 500);
    }
  },

  async createClass(req, res, next) {
    const { nom, niveau, annee_scolaire } = req.body;
    try {
      const etablissementId = await ClassModel.getEtablissementIdByAdminId(req.user.id);
      if (!etablissementId) {
        return response.error(res, 'Établissement non trouvé.', 404);
      }
      const newClass = await ClassModel.create(nom, niveau, etablissementId, annee_scolaire);
      return res.status(201).json(newClass);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la création.', 500);
    }
  },

  async updateClass(req, res, next) {
    const { nom, niveau, annee_scolaire } = req.body;
    try {
      const updatedClass = await ClassModel.update(req.params.id, nom, niveau, annee_scolaire);
      return res.json(updatedClass);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la modification.', 500);
    }
  },

  async assignMatieres(req, res, next) {
    const { matieres } = req.body; // [{matiere_id, coefficient}]
    const classeId = req.params.id;
    try {
      for (const m of matieres) {
        await ClassModel.assignMatiere(classeId, m.matiere_id, m.coefficient);
      }
      return response.success(res, null, 'Matières mises à jour pour cette classe.');
    } catch (err) {
      console.error(err);
      return response.error(res, "Erreur lors de l'assignation des matières.", 500);
    }
  },

  async listMatieres(req, res, next) {
    try {
      const matieres = await ClassModel.listMatieres(req.params.id);
      return res.json(matieres);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur serveur.', 500);
    }
  },

  async addSchedule(req, res, next) {
    const { matiere_id, professeur_id, jour_semaine, heure_debut, heure_fin, salle } = req.body;
    try {
      if (professeur_id) {
        const conflicts = await ProfModel.checkScheduleConflict(professeur_id, jour_semaine, heure_debut, heure_fin);
        if (conflicts.length > 0) {
          const c = conflicts[0];
          const alternatives = await ProfModel.getAvailableSlots(professeur_id, jour_semaine);
          let errMsg = `Cet enseignant est déjà occupé sur ce créneau (${c.heure_debut.slice(0, 5)} - ${c.heure_fin.slice(0, 5)}) dans l'établissement "${c.etablissement_nom}" (Classe: ${c.classe_nom}).`;
          if (alternatives.length > 0) {
            errMsg += ` Créneaux alternatifs disponibles pour ce jour : ${alternatives.join(', ')}`;
          } else {
            errMsg += ` Aucun autre créneau standard n'est disponible pour ce jour.`;
          }
          return response.error(res, errMsg, 400);
        }
      }

      await ClassModel.addSchedule(req.params.id, matiere_id, professeur_id, jour_semaine, heure_debut, heure_fin, salle);

      if (professeur_id) {
        const { rows: cls } = await db.query(
          `SELECT c.nom as classe_nom, et.nom as etablissement_nom 
           FROM classes c 
           JOIN etablissements et ON c.etablissement_id = et.id 
           WHERE c.id = $1`, 
          [req.params.id]
        );
        const cNom = cls[0]?.classe_nom || '';
        const eNom = cls[0]?.etablissement_nom || '';

        await db.query(
          `INSERT INTO notifications (user_id, titre, description, type, lu)
           VALUES ($1, $2, $3, $4, FALSE)`,
          [
            professeur_id,
            'Nouveau créneau planifié',
            `Un nouveau cours a été planifié le ${jour_semaine} de ${heure_debut.slice(0, 5)} à ${heure_fin.slice(0, 5)} pour la classe ${cNom} à l'établissement ${eNom}.`,
            'SCHEDULE'
          ]
        );
      }

      return res.status(201).json({ message: 'Emploi du temps mis à jour.' });
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la planification.', 500);
    }
  },

  async getSchedule(req, res, next) {
    try {
      const schedule = await ClassModel.getSchedule(req.params.id);
      return res.json(schedule);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur serveur.', 500);
    }
  },

  async deleteSchedule(req, res, next) {
    try {
      const { rows: slot } = await db.query(
        `SELECT edt.professeur_id, edt.jour_semaine, edt.heure_debut, edt.heure_fin, c.nom as classe_nom, et.nom as etablissement_nom 
         FROM emplois_du_temps edt
         JOIN classes c ON edt.classe_id = c.id
         JOIN etablissements et ON c.etablissement_id = et.id
         WHERE edt.id = $1`,
        [req.params.scheduleId]
      );

      await ClassModel.deleteSchedule(req.params.scheduleId, req.params.id);

      if (slot.length > 0 && slot[0].professeur_id) {
        const s = slot[0];
        await db.query(
          `INSERT INTO notifications (user_id, titre, description, type, lu)
           VALUES ($1, $2, $3, $4, FALSE)`,
          [
            s.professeur_id,
            'Créneau de cours annulé',
            `Le cours de ${s.jour_semaine} de ${s.heure_debut.slice(0, 5)} à ${s.heure_fin.slice(0, 5)} (${s.classe_nom}) à l'établissement ${s.etablissement_nom} a été annulé.`,
            'SCHEDULE'
          ]
        );
      }

      return res.json({ message: 'Créneau supprimé.' });
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la suppression.', 500);
    }
  },

  async addExam(req, res, next) {
    const { matiere_id, type_examen, date_examen, salle } = req.body;
    try {
      const etablissementId = await ClassModel.getEtablissementIdByClassId(req.params.id);
      await ClassModel.addExam(etablissementId, req.params.id, matiere_id, type_examen, date_examen, salle);
      return res.status(201).json({ message: 'Examen planifié.' });
    } catch (err) {
      console.error(err);
      return response.error(res, "Erreur lors de la planification de l'examen.", 500);
    }
  },

  async getExams(req, res, next) {
    try {
      const exams = await ClassModel.getExams(req.params.id);
      return res.json(exams);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur serveur.', 500);
    }
  },

  async updateExam(req, res, next) {
    const { matiere_id, type_examen, date_examen, salle } = req.body;
    try {
      const updatedExam = await ClassModel.updateExam(req.params.examId, req.params.id, matiere_id, type_examen, date_examen, salle);
      if (!updatedExam) {
        return response.error(res, 'Examen non trouvé.', 404);
      }
      return res.json(updatedExam);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la modification.', 500);
    }
  },

  async deleteExam(req, res, next) {
    try {
      await ClassModel.deleteExam(req.params.examId, req.params.id);
      return res.json({ message: 'Examen supprimé.' });
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la suppression.', 500);
    }
  },

  async getAllExams(req, res, next) {
    const { debut, fin } = req.query;
    try {
      const etablissementId = await ClassModel.getEtablissementIdByAdminId(req.user.id);
      if (!etablissementId) {
        return response.error(res, 'Établissement non trouvé.', 404);
      }
      const exams = await ClassModel.getAllEtablissementExams(etablissementId, debut, fin);
      return res.json(exams);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la récupération des examens.', 500);
    }
  }
};

module.exports = classController;
