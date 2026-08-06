const db = require('../config/db');

const ClassModel = {
  async getEtablissementIdByAdminId(adminId) {
    const { rows } = await db.query(
      'SELECT id FROM etablissements WHERE admin_id = $1',
      [adminId]
    );
    return rows[0]?.id;
  },

  async listClasses(etablissementId) {
    const { rows } = await db.query(
      'SELECT * FROM classes WHERE etablissement_id = $1 ORDER BY niveau, nom',
      [etablissementId]
    );
    return rows;
  },

  async create(nom, niveau, etablissementId, anneeScolaire) {
    const { rows } = await db.query(
      'INSERT INTO classes (nom, niveau, etablissement_id, annee_scolaire) VALUES ($1, $2, $3, $4) RETURNING *',
      [nom, niveau, etablissementId, anneeScolaire || '2025-2026']
    );
    return rows[0];
  },

  async update(id, nom, niveau, anneeScolaire) {
    const { rows } = await db.query(
      'UPDATE classes SET nom = $1, niveau = $2, annee_scolaire = $3 WHERE id = $4 RETURNING *',
      [nom, niveau, anneeScolaire, id]
    );
    return rows[0];
  },

  async assignMatiere(classeId, matiereId, coefficient) {
    await db.query(`
      INSERT INTO classe_matieres (classe_id, matiere_id, coefficient)
      VALUES ($1, $2, $3)
      ON CONFLICT (classe_id, matiere_id) DO UPDATE SET coefficient = EXCLUDED.coefficient
    `, [classeId, matiereId, coefficient]);
    return true;
  },

  async listMatieres(classeId) {
    const { rows } = await db.query(`
      SELECT m.*, cm.coefficient
      FROM matieres m
      JOIN classe_matieres cm ON m.id = cm.matiere_id
      WHERE cm.classe_id = $1
    `, [classeId]);
    return rows;
  },

  async addSchedule(classeId, matiereId, professeurId, jourSemaine, heureDebut, heureFin, salle) {
    await db.query(`
      INSERT INTO emplois_du_temps (classe_id, matiere_id, professeur_id, jour_semaine, heure_debut, heure_fin, salle)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [classeId, matiereId, professeurId, jourSemaine, heureDebut, heureFin, salle]);
    return true;
  },

  async getSchedule(classeId) {
    const { rows } = await db.query(`
      SELECT edt.*, m.nom as matiere_nom, COALESCE(u.email, 'Non assigné') as professeur_nom
      FROM emplois_du_temps edt
      JOIN matieres m ON edt.matiere_id = m.id
      LEFT JOIN users u ON edt.professeur_id = u.id
      WHERE edt.classe_id = $1
      ORDER BY jour_semaine, heure_debut
    `, [classeId]);
    return rows;
  },

  async deleteSchedule(scheduleId, classeId) {
    await db.query('DELETE FROM emplois_du_temps WHERE id = $1 AND classe_id = $2', [scheduleId, classeId]);
    return true;
  },

  async getEtablissementIdByClassId(classeId) {
    const { rows } = await db.query('SELECT etablissement_id FROM classes WHERE id = $1', [classeId]);
    return rows[0]?.etablissement_id;
  },

  async addExam(etablissementId, classeId, matiereId, typeExamen, dateExamen, salle) {
    await db.query(`
      INSERT INTO examens_planification (etablissement_id, classe_id, matiere_id, type_examen, date_examen, salle)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [etablissementId, classeId, matiereId, typeExamen, dateExamen, salle]);
    return true;
  },

  async getExams(classeId) {
    const { rows } = await db.query(`
      SELECT ep.*, m.nom as matiere_nom
      FROM examens_planification ep
      JOIN matieres m ON ep.matiere_id = m.id
      WHERE ep.classe_id = $1
      ORDER BY ep.date_examen
    `, [classeId]);
    return rows;
  },

  async updateExam(examId, classeId, matiereId, typeExamen, dateExamen, salle) {
    const { rows } = await db.query(`
      UPDATE examens_planification
      SET matiere_id = $1, type_examen = $2, date_examen = $3, salle = $4
      WHERE id = $5 AND classe_id = $6
      RETURNING *
    `, [matiereId, typeExamen, dateExamen, salle, examId, classeId]);
    return rows[0];
  },

  async deleteExam(examId, classeId) {
    await db.query('DELETE FROM examens_planification WHERE id = $1 AND classe_id = $2', [examId, classeId]);
    return true;
  },

  async getAllEtablissementExams(etablissementId, debut = null, fin = null) {
    let query = `
      SELECT ep.*, m.nom as matiere_nom, c.nom as classe_nom
      FROM examens_planification ep
      JOIN matieres m ON ep.matiere_id = m.id
      JOIN classes c ON ep.classe_id = c.id
      WHERE ep.etablissement_id = $1
    `;
    const params = [etablissementId];

    if (debut && fin) {
      query += ` AND ep.date_examen >= $2 AND ep.date_examen <= $3`;
      params.push(debut, fin);
    }

    query += ` ORDER BY ep.date_examen`;

    const { rows } = await db.query(query, params);
    return rows;
  }
};

module.exports = ClassModel;
