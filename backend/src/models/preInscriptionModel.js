const db = require('../config/db');

const PreInscriptionModel = {
  async getEtablissementIdByAdminId(adminId) {
    const { rows } = await db.query(
      'SELECT id FROM etablissements WHERE admin_id = $1',
      [adminId]
    );
    return rows[0]?.id;
  },

  async getPublicClassDetails(classId) {
    const { rows } = await db.query(`
      SELECT c.nom as classe_nom, c.niveau, e.nom as etablissement_nom, e.id as etablissement_id
      FROM classes c
      JOIN etablissements e ON c.etablissement_id = e.id
      WHERE c.id = $1
    `, [classId]);
    return rows[0];
  },

  async checkStudentExists(identifiantExistant) {
    const { rows } = await db.query('SELECT id FROM eleves WHERE identifiant_national = $1', [identifiantExistant]);
    return rows[0];
  },

  async countStudents() {
    const { rows } = await db.query('SELECT COUNT(*) FROM eleves');
    return parseInt(rows[0].count);
  },

  async createPreInscription(data) {
    const {
      classe_id, etablissement_id, nom, prenom, sexe, date_naissance,
      lieu_naissance, nationalite, telephone, coordonnees_parent, statut,
      identifiant_existant, photo_url
    } = data;

    const { rows } = await db.query(`
      INSERT INTO pre_inscriptions (
        classe_id, etablissement_id, nom, prenom, sexe, date_naissance,
        lieu_naissance, nationalite, telephone, coordonnees_parent, statut,
        identifiant_existant, photo_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *
    `, [
      classe_id, etablissement_id, nom, prenom, sexe || 'M', date_naissance,
      lieu_naissance, nationalite, telephone, coordonnees_parent, statut || 'APTE',
      identifiant_existant || null, photo_url
    ]);
    return rows[0];
  },

  async getPendingPreInscriptions(etablissementId) {
    const { rows } = await db.query(`
      SELECT p.*, c.nom as classe_nom
      FROM pre_inscriptions p
      JOIN classes c ON p.classe_id = c.id
      WHERE p.etablissement_id = $1 AND p.statut_validation = 'EN_ATTENTE'
      ORDER BY p.created_at DESC
    `, [etablissementId]);
    return rows;
  },

  async getPreInscriptionById(id) {
    const { rows } = await db.query('SELECT * FROM pre_inscriptions WHERE id = $1', [id]);
    return rows[0];
  },

  async updatePreInscription(id, fields) {
    const {
      nom, prenom, sexe, date_naissance, lieu_naissance,
      nationalite, telephone, coordonnees_parent, statut, identifiant_existant
    } = fields;

    const { rows } = await db.query(`
      UPDATE pre_inscriptions
      SET nom = $1, prenom = $2, sexe = $3, date_naissance = $4, lieu_naissance = $5,
          nationalite = $6, telephone = $7, coordonnees_parent = $8, statut = $9,
          identifiant_existant = $10
      WHERE id = $11 RETURNING *
    `, [
      nom, prenom, sexe || 'M', date_naissance, lieu_naissance,
      nationalite, telephone, coordonnees_parent, statut, identifiant_existant || null, id
    ]);
    return rows[0];
  },

  async getStudentByNationalId(identifiantNational, client = db) {
    const { rows } = await client.query('SELECT id, user_id FROM eleves WHERE identifiant_national = $1', [identifiantNational]);
    return rows[0];
  },

  async updateStudentProfile(eleveId, data, client = db) {
    await client.query(`
      UPDATE eleves
      SET etablissement_id = $1, nom = $2, prenom = $3, sexe = $4, date_naissance = $5,
          lieu_naissance = $6, nationalite = $7, telephone = $8, coordonnees_parent = $9, statut = $10,
          photo_url = COALESCE($11, photo_url)
      WHERE id = $12
    `, [
      data.etablissement_id, data.nom, data.prenom, data.sexe || 'M', data.date_naissance,
      data.lieu_naissance, data.nationalite, data.telephone, data.coordonnees_parent, data.statut,
      data.photo_url, eleveId
    ]);
    return true;
  },

  async addInscriptionClass(eleveId, classId, client = db) {
    await client.query(`
      INSERT INTO inscription_classes (eleve_id, classe_id)
      VALUES ($1, $2)
    `, [eleveId, classId]);
    return true;
  },

  async setValidationStatus(id, status, client = db) {
    await client.query(`
      UPDATE pre_inscriptions
      SET statut_validation = $1
      WHERE id = $2
    `, [status, id]);
    return true;
  },

  async createUser(email, identifiantNational, passwordHash, tempPassword, role, client = db) {
    const { rows } = await client.query(`
      INSERT INTO users (email, identifiant_national, password_hash, password_provisoire, role)
      VALUES ($1, $2, $3, $4, $5) RETURNING id
    `, [email, identifiantNational, passwordHash, tempPassword, role]);
    return rows[0];
  },

  async createStudent(data, client = db) {
    const { rows } = await client.query(`
      INSERT INTO eleves (
        identifiant_national, user_id, etablissement_id, nom, prenom, sexe,
        date_naissance, lieu_naissance, nationalite, telephone,
        coordonnees_parent, statut, photo_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id
    `, [
      data.identifiant_national, data.user_id, data.etablissement_id, data.nom, data.prenom, data.sexe || 'M',
      data.date_naissance, data.lieu_naissance, data.nationalite, data.telephone,
      data.coordonnees_parent, data.statut, data.photo_url
    ]);
    return rows[0]?.id;
  }
};

module.exports = PreInscriptionModel;
