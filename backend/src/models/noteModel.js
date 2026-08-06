const db = require('../config/db');

const NoteModel = {
  async getEtablissementIdByAdminId(adminId) {
    const { rows } = await db.query(
      'SELECT id FROM etablissements WHERE admin_id = $1',
      [adminId]
    );
    return rows[0]?.id;
  },

  async getAllMatieres() {
    const { rows } = await db.query('SELECT * FROM matieres ORDER BY nom');
    return rows;
  },

  async createMatiere(nom, code) {
    const codeMatiere = code || nom.substring(0, 3).toUpperCase();
    const { rows } = await db.query(
      'INSERT INTO matieres (nom, code_matiere) VALUES ($1, $2) RETURNING *',
      [nom, codeMatiere]
    );
    return rows[0];
  },

  async updateMatiere(id, nom, code) {
    const { rows } = await db.query(
      'UPDATE matieres SET nom = $1, code_matiere = $2 WHERE id = $3 RETURNING *',
      [nom, code, id]
    );
    return rows[0];
  },

  async deleteMatiere(id) {
    await db.query('DELETE FROM matieres WHERE id = $1', [id]);
    return true;
  },

  async getStudentNotesByClassAndMatiere(classeId, matiereId, semestre) {
    const { rows } = await db.query(`
      SELECT 
        e.id as eleve_id, e.nom, e.prenom,
        (SELECT valeur FROM notes WHERE eleve_id = e.id AND matiere_id = $2 AND type_note = 'DEVOIR' AND semestre = $3 LIMIT 1) as note_devoir,
        (SELECT valeur FROM notes WHERE eleve_id = e.id AND matiere_id = $2 AND type_note = 'EXAMEN' AND semestre = $3 LIMIT 1) as note_examen,
        (SELECT appreciation FROM notes WHERE eleve_id = e.id AND matiere_id = $2 AND type_note = 'EXAMEN' AND semestre = $3 LIMIT 1) as appreciation,
        (SELECT etablissement_origine_id FROM notes WHERE eleve_id = e.id AND matiere_id = $2 AND semestre = $3 LIMIT 1) as etablissement_origine_id
      FROM eleves e
      JOIN inscription_classes ic ON e.id = ic.eleve_id
      WHERE ic.classe_id = $1
      ORDER BY e.nom, e.prenom
    `, [classeId, matiereId, semestre || 1]);
    return rows;
  },

  async checkExistingNote(eleveId, matiereId, semestre, trimestre, typeNote, client = db) {
    const { rows } = await client.query(`
      SELECT id, valeur, appreciation, etablissement_origine_id FROM notes 
      WHERE eleve_id = $1 AND matiere_id = $2 AND semestre = $3 AND (trimestre = $4 OR ($4 IS NULL AND trimestre IS NULL)) AND type_note = $5
    `, [eleveId, matiereId, semestre || 1, trimestre || null, typeNote || 'DEVOIR']);
    return rows[0];
  },

  async logNoteHistory(noteId, oldVal, newVal, oldAppr, newAppr, authorId, client = db) {
    await client.query(`
      INSERT INTO historique_notes (note_id, ancienne_valeur, nouvelle_valeur, ancienne_appreciation, nouvelle_appreciation, auteur_id)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [noteId, oldVal, newVal, oldAppr, newAppr, authorId]);
    return true;
  },

  async updateNote(noteId, valeur, appreciation, client = db) {
    await client.query(`
      UPDATE notes SET valeur = $1, appreciation = $2, updated_at = NOW()
      WHERE id = $3
    `, [valeur, appreciation, noteId]);
    return true;
  },

  async insertNote(data, client = db) {
    const {
      eleveId, matiereId, valeur, appreciation, semestre, trimestre, typeNote, professeurId, etablissementId
    } = data;

    await client.query(`
      INSERT INTO notes (eleve_id, matiere_id, valeur, appreciation, semestre, trimestre, type_note, professeur_id, etablissement_origine_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [eleveId, matiereId, valeur, appreciation, semestre || 1, trimestre || null, typeNote || 'DEVOIR', professeurId, etablissementId]);
    return true;
  },

  async calculateClassAverages(classeId, semestre) {
    const { rows } = await db.query(`
      SELECT 
        e.id as eleve_id, e.nom, e.prenom,
        SUM(n.valeur * cm.coefficient) / SUM(cm.coefficient) as moyenne_generale,
        COUNT(a.id) as total_absences,
        SUM(a.points_deduits) as total_points_perdus
      FROM eleves e
      JOIN inscription_classes ic ON e.id = ic.eleve_id
      JOIN classe_matieres cm ON ic.classe_id = cm.classe_id
      LEFT JOIN notes n ON e.id = n.eleve_id AND n.matiere_id = cm.matiere_id
      LEFT JOIN absences a ON e.id = a.eleve_id AND a.date_absence BETWEEN '2025-01-01' AND '2025-12-31'
      WHERE ic.classe_id = $1
      AND (n.semestre = $2 OR $2 IS NULL)
      GROUP BY e.id, e.nom, e.prenom
    `, [classeId, semestre]);
    return rows;
  },

  async getClassMoyennesForDashboard(etablissementId, semestre, anneeScolaire) {
    const { rows } = await db.query(`
      SELECT 
        c.id as classe_id,
        c.nom as classe_nom,
        c.niveau,
        c.annee_scolaire,
        COALESCE(
          SUM(eleve_notes.total_pondere) / NULLIF(SUM(eleve_notes.total_coeff), 0),
          0
        ) as moyenne_generale
      FROM classes c
      LEFT JOIN (
        SELECT 
          ic.classe_id,
          ic.eleve_id,
          SUM(n.valeur * COALESCE(n.coefficient, 1)) as total_pondere,
          SUM(COALESCE(n.coefficient, 1)) as total_coeff
        FROM inscription_classes ic
        LEFT JOIN notes n ON ic.eleve_id = n.eleve_id AND (n.semestre = $1 OR $1 IS NULL)
        GROUP BY ic.classe_id, ic.eleve_id
      ) eleve_notes ON c.id = eleve_notes.classe_id
      WHERE c.etablissement_id = $2
        AND ($3::text IS NULL OR c.annee_scolaire = $3)
      GROUP BY c.id, c.nom, c.niveau, c.annee_scolaire
      ORDER BY c.niveau, c.nom
    `, [semestre || 1, etablissementId, anneeScolaire || null]);
    return rows;
  },

  async getPromotionRules(etablissementId) {
    const { rows } = await db.query('SELECT * FROM regles_passage WHERE etablissement_id = $1', [etablissementId]);
    return rows[0];
  },

  async createDefaultPromotionRules(etablissementId) {
    const { rows } = await db.query(`
      INSERT INTO regles_passage (etablissement_id, seuil_passage_direct, seuil_passage, seuil_cours_vacances)
      VALUES ($1, 12.00, 10.00, 8.00) RETURNING *
    `, [etablissementId]);
    return rows[0];
  },

  async savePromotionRules(etablissementId, seuilPassageDirect, seuilPassage, seuilCoursVacances) {
    const { rows } = await db.query(`
      INSERT INTO regles_passage (etablissement_id, seuil_passage_direct, seuil_passage, seuil_cours_vacances)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (etablissement_id)
      DO UPDATE SET seuil_passage_direct = $2, seuil_passage = $3, seuil_cours_vacances = $4, updated_at = NOW()
      RETURNING *
    `, [etablissementId, seuilPassageDirect, seuilPassage, seuilCoursVacances]);
    return rows[0];
  },

  async calculateYearlyClassAverages(classeId) {
    const { rows } = await db.query(`
      SELECT 
        e.id as eleve_id, e.nom, e.prenom,
        ROUND((SUM(n.valeur * COALESCE(cm.coefficient, n.coefficient, 1)) / NULLIF(SUM(COALESCE(cm.coefficient, n.coefficient, 1)), 0))::numeric, 2) as moyenne_annuelle,
        c.niveau
      FROM eleves e
      JOIN inscription_classes ic ON e.id = ic.eleve_id
      JOIN classes c ON ic.classe_id = c.id
      LEFT JOIN notes n ON e.id = n.eleve_id AND n.type_note = 'EXAMEN'
      LEFT JOIN classe_matieres cm ON ic.classe_id = cm.classe_id AND cm.matiere_id = n.matiere_id
      WHERE ic.classe_id = $1
      GROUP BY e.id, e.nom, e.prenom, c.niveau
      ORDER BY e.nom, e.prenom
    `, [classeId]);
    return rows;
  },

  async getSavedBulletins(classeId, anneeScolaire) {
    const { rows } = await db.query(`
      SELECT eleve_id, decision, decision_detail FROM bulletins
      WHERE classe_id = $1 AND (annee_scolaire = $2 OR $2 IS NULL)
    `, [classeId, anneeScolaire || null]);
    return rows;
  },

  async saveBulletinDecision(eleveId, classeId, anneeScolaire, moyenneGenerale, decision, decisionDetail, decisionAuto, client = db) {
    await client.query(`
      INSERT INTO bulletins (eleve_id, classe_id, annee_scolaire, moyenne_generale, decision, decision_detail, decision_auto)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (eleve_id, classe_id, annee_scolaire) 
      DO UPDATE SET moyenne_generale = $4, decision = $5, decision_detail = $6, decision_auto = $7
    `, [
      eleveId,
      classeId,
      anneeScolaire || '',
      moyenneGenerale,
      decision,
      decisionDetail,
      decisionAuto !== false
    ]);
    return true;
  }
};

module.exports = NoteModel;
