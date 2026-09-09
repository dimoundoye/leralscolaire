const db = require('../config/db');

const StudentModel = {
  async getEtablissementIdByAdminId(adminId) {
    const { rows } = await db.query(
      'SELECT id FROM etablissements WHERE admin_id = $1',
      [adminId]
    );
    return rows[0]?.id;
  },

  async getEtablissementByAdminId(adminId) {
    const { rows } = await db.query(
      'SELECT id, nom, region, ville, code_etablissement FROM etablissements WHERE admin_id = $1',
      [adminId]
    );
    return rows[0];
  },

  async getEtablissementById(id) {
    const { rows } = await db.query(
      'SELECT id, nom, region, ville, code_etablissement FROM etablissements WHERE id = $1',
      [id]
    );
    return rows[0];
  },

  async countStudents() {
    const { rows } = await db.query('SELECT COUNT(*) FROM eleves');
    return parseInt(rows[0].count);
  },

  async listStudents(etablissementId) {
    const { rows } = await db.query(`
      SELECT DISTINCT ON (e.id) e.*, c.nom as classe_nom, ic.classe_id, u.password_provisoire,
             (SELECT t.statut_transfert FROM transferts_eleves t WHERE t.eleve_id = e.id AND t.statut_transfert = 'EN_ATTENTE' ORDER BY t.date_transfert DESC LIMIT 1) as statut_transfert_en_attente
      FROM eleves e
      LEFT JOIN users u ON e.user_id = u.id
      LEFT JOIN inscription_classes ic ON e.id = ic.eleve_id
      LEFT JOIN classes c ON ic.classe_id = c.id
      WHERE e.etablissement_id = $1
      ORDER BY e.id, ic.date_inscription DESC NULLS LAST
    `, [etablissementId]);
    return rows;
  },

  async createUser(email, identifiantNational, passwordHash, tempPassword, role, client = db) {
    const { rows } = await client.query(
      'INSERT INTO users (email, identifiant_national, password_hash, password_provisoire, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [email, identifiantNational, passwordHash, tempPassword, role]
    );
    return rows[0];
  },

  async createStudent(data, client = db) {
    const {
      identifiant_national, user_id, etablissement_id, nom, prenom, sexe,
      date_naissance, lieu_naissance, nationalite, telephone,
      coordonnees_parent, photo_url, justificatif_inapte_url, statut, email
    } = data;

    const { rows } = await client.query(
      `INSERT INTO eleves (
        identifiant_national, user_id, etablissement_id, nom, prenom, sexe,
        date_naissance, lieu_naissance, nationalite, telephone,
        coordonnees_parent, photo_url, justificatif_inapte_url, statut, email
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
      [
        identifiant_national, user_id, etablissement_id, nom, prenom, sexe || 'M',
        date_naissance, lieu_naissance, nationalite, telephone,
        coordonnees_parent, photo_url, justificatif_inapte_url || null, statut || 'APTE', email || null
      ]
    );
    return rows[0];
  },

  async addInscriptionClass(eleveId, classeId, client = db) {
    await client.query(
      'INSERT INTO inscription_classes (eleve_id, classe_id) VALUES ($1, $2)',
      [eleveId, classeId]
    );
    return true;
  },

  async getEtablissementClassByName(classeNom, etablissementId) {
    const { rows } = await db.query(
      'SELECT id FROM classes WHERE nom ILIKE $1 AND etablissement_id = $2 LIMIT 1',
      [classeNom, etablissementId]
    );
    return rows[0]?.id;
  },

  async getExportStudents(etablissementId, classeId = null) {
    let query = `
      SELECT e.identifiant_national as "ID National", e.nom as Nom, e.prenom as Prenom, e.sexe as "Sexe",
             u.password_provisoire as "Mot de passe provisoire", c.nom as Classe, e.statut as Statut
      FROM eleves e
      JOIN users u ON e.user_id = u.id
      LEFT JOIN inscription_classes ic ON e.id = ic.eleve_id
      LEFT JOIN classes c ON ic.classe_id = c.id
      WHERE e.etablissement_id = $1
    `;
    let params = [etablissementId];

    if (classeId && classeId !== 'undefined') {
      query += ` AND ic.classe_id = $2`;
      params.push(classeId);
    }

    const { rows } = await db.query(query, params);
    return rows;
  },

  async updateStudent(id, fields, photoUrl = null, justificatifUrl = undefined) {
    const { nom, prenom, sexe, date_naissance, lieu_naissance, nationalite, telephone, coordonnees_parent, statut, email } = fields;
    let query = `UPDATE eleves SET nom = $1, prenom = $2, sexe = $3, date_naissance = $4, lieu_naissance = $5, nationalite = $6, telephone = $7, coordonnees_parent = $8, statut = $9, email = $10`;
    let params = [nom, prenom, sexe || 'M', date_naissance, lieu_naissance, nationalite, telephone, coordonnees_parent, statut, email || null];
    if (photoUrl !== null && photoUrl !== undefined) {
      query += `, photo_url = $${params.length + 1}`;
      params.push(photoUrl);
    }
    if (justificatifUrl !== undefined) {
      query += `, justificatif_inapte_url = $${params.length + 1}`;
      params.push(justificatifUrl);
    }
    query += ` WHERE id = $${params.length + 1} RETURNING *`;
    params.push(id);
    const { rows } = await db.query(query, params);
    return rows[0];
  },

  async clearStudentClassEnrollments(eleveId) {
    await db.query('DELETE FROM inscription_classes WHERE eleve_id = $1', [eleveId]);
    return true;
  },

  async getStudentUserId(eleveId) {
    const { rows } = await db.query('SELECT user_id FROM eleves WHERE id = $1', [eleveId]);
    return rows[0]?.user_id;
  },

  async deleteUser(userId) {
    await db.query('DELETE FROM users WHERE id = $1', [userId]);
    return true;
  },

  async deleteStudent(eleveId) {
    await db.query('DELETE FROM eleves WHERE id = $1', [eleveId]);
    return true;
  },

  async getStudentById(eleveId, client = db) {
    const { rows } = await client.query('SELECT id, etablissement_id FROM eleves WHERE id = $1', [eleveId]);
    return rows[0];
  },

  async createTransferRecord(eleveId, ancienEtablissementId, nouveauEtablissementId, motif, client = db) {
    await client.query(
      `INSERT INTO transferts_eleves (eleve_id, ancien_etablissement_id, nouveau_etablissement_id, motif, statut_transfert)
       VALUES ($1, $2, $3, $4, 'EN_ATTENTE')`,
      [eleveId, ancienEtablissementId, nouveauEtablissementId, motif]
    );
    return true;
  },

  async createPendingTransfersBulk(eleveIds, ancienEtablissementId, nouveauEtablissementId, motif, client = db) {
    for (const eleveId of eleveIds) {
      await client.query(
        `INSERT INTO transferts_eleves (eleve_id, ancien_etablissement_id, nouveau_etablissement_id, motif, statut_transfert)
         VALUES ($1, $2, $3, $4, 'EN_ATTENTE')`,
        [eleveId, ancienEtablissementId, nouveauEtablissementId, motif]
      );
    }
    return true;
  },

  async getIncomingTransfers(etablissementId) {
    const { rows } = await db.query(`
      SELECT t.*, e.nom as eleve_nom, e.prenom as eleve_prenom, e.identifiant_national, e.photo_url, etab_ancien.nom as ancien_etablissement_nom
      FROM transferts_eleves t
      JOIN eleves e ON t.eleve_id = e.id
      JOIN etablissements etab_ancien ON t.ancien_etablissement_id = etab_ancien.id
      WHERE t.nouveau_etablissement_id = $1 AND t.statut_transfert = 'EN_ATTENTE'
      ORDER BY t.date_transfert DESC
    `, [etablissementId]);
    return rows;
  },

  async getOutgoingTransfers(etablissementId) {
    const { rows } = await db.query(`
      SELECT t.*, e.nom as eleve_nom, e.prenom as eleve_prenom, e.identifiant_national, etab_nouveau.nom as nouveau_etablissement_nom
      FROM transferts_eleves t
      JOIN eleves e ON t.eleve_id = e.id
      JOIN etablissements etab_nouveau ON t.nouveau_etablissement_id = etab_nouveau.id
      WHERE t.ancien_etablissement_id = $1
      ORDER BY t.date_transfert DESC
    `, [etablissementId]);
    return rows;
  },

  async getTransferById(transferId, client = db) {
    const { rows } = await client.query('SELECT * FROM transferts_eleves WHERE id = $1', [transferId]);
    return rows[0];
  },

  async acceptTransfer(transferId, nouveauEtablissementId, client = db) {
    const transfer = await this.getTransferById(transferId, client);
    if (!transfer || transfer.nouveau_etablissement_id !== nouveauEtablissementId) {
      throw new Error('Demande de transfert invalide ou non autorisée.');
    }
    if (transfer.statut_transfert !== 'EN_ATTENTE') {
      throw new Error('Cette demande de transfert a déjà été traitée.');
    }

    await client.query(
      `UPDATE transferts_eleves SET statut_transfert = 'VALIDE' WHERE id = $1`,
      [transferId]
    );

    await this.updateStudentEtablissement(transfer.eleve_id, nouveauEtablissementId, client);
    await this.ensureNullClassInscription(transfer.eleve_id, client);
    return transfer;
  },

  async rejectTransfer(transferId, nouveauEtablissementId, client = db) {
    const transfer = await this.getTransferById(transferId, client);
    if (!transfer || transfer.nouveau_etablissement_id !== nouveauEtablissementId) {
      throw new Error('Demande de transfert invalide ou non autorisée.');
    }
    if (transfer.statut_transfert !== 'EN_ATTENTE') {
      throw new Error('Cette demande de transfert a déjà été traitée.');
    }

    await client.query(
      `UPDATE transferts_eleves SET statut_transfert = 'REJETE' WHERE id = $1`,
      [transferId]
    );
    return true;
  },

  async cancelTransfer(transferId, ancienEtablissementId, client = db) {
    const { rowCount } = await client.query(
      `DELETE FROM transferts_eleves WHERE id = $1 AND ancien_etablissement_id = $2 AND statut_transfert = 'EN_ATTENTE'`,
      [transferId, ancienEtablissementId]
    );
    return rowCount > 0;
  },

  async updateStudentEtablissement(eleveId, nouveauEtablissementId, client = db) {
    await client.query(
      "UPDATE eleves SET etablissement_id = $1, statut = 'TRANSFERE' WHERE id = $2",
      [nouveauEtablissementId, eleveId]
    );
    return true;
  },

  async ensureNullClassInscription(eleveId, client = db) {
    await client.query(`
      INSERT INTO inscription_classes (eleve_id, classe_id, date_inscription)
      SELECT $1, NULL, NOW()
      WHERE NOT EXISTS (
        SELECT 1 FROM inscription_classes WHERE eleve_id = $1 AND classe_id IS NULL
      )
    `, [eleveId]);
    return true;
  }
};

module.exports = StudentModel;
