const db = require('../config/db');

const MessageModel = {
  async sendMessage(expediteurId, destinataireType, destinataireId, sujet, contenu, etablissementId = null, fichierUrl = null, fichierNom = null) {
    const { rows } = await db.query(`
      INSERT INTO messages (expediteur_id, destinataire_type, destinataire_id, sujet, contenu, etablissement_id, fichier_url, fichier_nom)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
    `, [expediteurId, destinataireType, destinataireId, sujet, contenu, etablissementId, fichierUrl, fichierNom]);
    return rows[0];
  },

  async getStudentDetailsByUserId(userId) {
    const { rows } = await db.query('SELECT id, etablissement_id FROM eleves WHERE user_id = $1', [userId]);
    return rows[0];
  },

  async getStudentEnrollmentByStudentId(eleveId) {
    const { rows } = await db.query('SELECT classe_id FROM inscription_classes WHERE eleve_id = $1', [eleveId]);
    return rows[0];
  },

  async getEtablissementIdByAdminId(adminId) {
    const { rows } = await db.query('SELECT id FROM etablissements WHERE admin_id = $1', [adminId]);
    return rows[0]?.id;
  },

  async getTeacherEtablissements(profUserId) {
    const { rows } = await db.query(`
      SELECT e.id as etablissement_id, e.nom as etablissement_nom, e.ville, e.region,
             pe.droit_envoi_message, e.admin_id
      FROM etablissements e
      JOIN professeurs_etablissements pe ON e.id = pe.etablissement_id
      WHERE pe.professeur_id = $1 AND pe.statut = 'ACCEPTE'
    `, [profUserId]);
    return rows;
  },


  async getTeacherClasses(profUserId) {
    const { rows } = await db.query(`
      SELECT DISTINCT c2.id as classe_id, c2.nom as classe_nom, c2.niveau, c2.annee_scolaire, c2.etablissement_id, et.nom as etablissement_nom, pe.droit_envoi_message
      FROM (
        SELECT classe_id FROM professeur_matieres WHERE professeur_id = $1
        UNION
        SELECT classe_id FROM emplois_du_temps WHERE professeur_id = $1
      ) pm_classes
      JOIN classes c1 ON pm_classes.classe_id = c1.id
      JOIN classes c2 ON c1.nom = c2.nom AND c1.etablissement_id = c2.etablissement_id
      JOIN etablissements et ON c2.etablissement_id = et.id
      JOIN professeurs_etablissements pe ON c2.etablissement_id = pe.etablissement_id AND pe.professeur_id = $1
      WHERE pe.statut = 'ACCEPTE'
      ORDER BY c2.annee_scolaire DESC, c2.nom ASC
    `, [profUserId]);
    return rows;
  },


  async getEtablissementAdminDetails(userId) {
    const { rows } = await db.query(`
      SELECT et.id as etablissement_id, et.nom as etablissement_nom, u.id as admin_user_id
      FROM eleves e
      JOIN etablissements et ON e.etablissement_id = et.id
      JOIN users u ON et.admin_id = u.id
      WHERE e.user_id = $1
    `, [userId]);
    return rows[0];
  },

  async getAdminEtablissementTeachers(etablissementId) {
    const { rows } = await db.query(`
      SELECT u.id, u.email, p.prenom, p.nom, 'PROFESSEUR' as type
      FROM users u
      JOIN professeurs p ON u.id = p.id
      JOIN professeurs_etablissements pe ON u.id = pe.professeur_id
      WHERE pe.etablissement_id = $1 AND pe.statut = 'ACCEPTE'
    `, [etablissementId]);
    return rows;
  },

  async getAdminEtablissementStudents(etablissementId) {
    const { rows } = await db.query(`
      SELECT u.id, u.email, e.prenom, e.nom, 'ELEVE' as type
      FROM users u
      JOIN eleves e ON u.id = e.user_id
      WHERE e.etablissement_id = $1
    `, [etablissementId]);
    return rows;
  },

  async getDirectChatHistory(etablissementId, userId1, userId2) {
    const { rows } = await db.query(`
      SELECT m.*, u.email as expediteur_nom, u.role as expediteur_role,
             COALESCE(p.prenom || ' ' || p.nom, el.prenom || ' ' || el.nom, 'Admin') as expediteur_nom_complet
      FROM messages m
      JOIN users u ON m.expediteur_id = u.id
      LEFT JOIN professeurs p ON p.id = u.id
      LEFT JOIN eleves el ON el.user_id = u.id
      WHERE (m.etablissement_id = $1)
        AND ((m.expediteur_id = $2 AND m.destinataire_id = $3) OR (m.expediteur_id = $3 AND m.destinataire_id = $2))
      ORDER BY m.date_envoi ASC
    `, [etablissementId, userId1, userId2]);
    return rows;
  },

  async getClassGroupChatHistory(classeId) {
    const { rows } = await db.query(`
      SELECT m.*, u.email as expediteur_nom, u.role as expediteur_role,
             COALESCE(p.prenom || ' ' || p.nom, el.prenom || ' ' || el.nom, u.email, 'Administration') as expediteur_nom_complet
      FROM messages m
      JOIN users u ON m.expediteur_id = u.id
      LEFT JOIN professeurs p ON p.id = u.id
      LEFT JOIN eleves el ON el.user_id = u.id
      WHERE m.destinataire_type = 'CLASSE' AND m.destinataire_id = $1
      ORDER BY m.date_envoi ASC
    `, [classeId]);
    return rows;
  },

  async getOfficeBacChatHistory(userId = null) {
    let query = `
      SELECT m.*, u.email as expediteur_nom, u.role as expediteur_role, 'Office du BAC' as expediteur_nom_complet
      FROM messages m
      JOIN users u ON m.expediteur_id = u.id
    `;
    let params = [];
    if (userId) {
      query += ` WHERE (m.destinataire_type IN ('PROFESSEUR', 'OFFICE_BAC') AND m.destinataire_id = $1) OR (m.destinataire_type = 'ALL_PROFESSEURS') OR (m.expediteur_id = $1)`;
      params = [userId];
    } else {
      query += ` WHERE m.destinataire_type IN ('OFFICE_BAC', 'PROFESSEUR')`;
    }
    query += ` ORDER BY m.date_envoi ASC`;

    const { rows } = await db.query(query, params);
    return rows;
  },

  async markMessagesAsRead(expediteurId, destinataireId, etablissementId) {
    await db.query(`
      UPDATE messages 
      SET lu = TRUE 
      WHERE expediteur_id != $2
        AND (expediteur_id = $1 OR destinataire_id = $2 OR destinataire_type IN ('PROFESSEUR', 'ADMIN_ETABLISSEMENT', 'ELEVE'))
        AND lu = FALSE
    `, [expediteurId, destinataireId]);
    return true;
  },

  async markClassMessagesAsRead(classeId, userId) {
    await db.query(`
      UPDATE messages 
      SET lu = TRUE 
      WHERE destinataire_type = 'CLASSE' 
        AND destinataire_id = $1 
        AND expediteur_id != $2 
        AND lu = FALSE
    `, [classeId, userId]);
    return true;
  },

  async getInboxMessages(role, userId) {
    let query = `
      SELECT m.*, u.email as expediteur_nom, et.nom as etablissement_nom,
             COALESCE(p.prenom || ' ' || p.nom, el.prenom || ' ' || el.nom, 'Admin') as expediteur_nom_complet
      FROM messages m
      JOIN users u ON m.expediteur_id = u.id
      LEFT JOIN etablissements et ON m.etablissement_id = et.id
      LEFT JOIN professeurs p ON p.id = u.id
      LEFT JOIN eleves el ON el.user_id = u.id
      WHERE (m.destinataire_type = 'ELEVE' AND m.destinataire_id = $1)
    `;
    let params = [userId];

    if (role === 'ELEVE') {
      const student = await this.getStudentDetailsByUserId(userId);
      if (student) {
        const enrollment = await this.getStudentEnrollmentByStudentId(student.id);
        if (enrollment) {
          query += ` OR (m.destinataire_type = 'CLASSE' AND m.destinataire_id = $2)`;
          params.push(enrollment.classe_id);
        }
      }
      query += ` OR m.destinataire_type = 'OFFICE_BAC'`;
    } else if (role === 'ADMIN_ETABLISSEMENT') {
      const etablissementId = await this.getEtablissementIdByAdminId(userId);
      query = `
        SELECT m.*, u.email as expediteur_nom,
               COALESCE(p.prenom || ' ' || p.nom, el.prenom || ' ' || el.nom, 'Admin') as expediteur_nom_complet
        FROM messages m
        JOIN users u ON m.expediteur_id = u.id
        LEFT JOIN professeurs p ON p.id = u.id
        LEFT JOIN eleves el ON el.user_id = u.id
        WHERE (m.destinataire_type = 'ADMIN_ETABLISSEMENT' AND m.etablissement_id = $1)
           OR m.destinataire_type = 'OFFICE_BAC'
      `;
      params = [etablissementId];
    } else if (role === 'PROFESSEUR') {
      query = `
        SELECT m.*, u.email as expediteur_nom, et.nom as etablissement_nom,
               COALESCE(p.prenom || ' ' || p.nom, el.prenom || ' ' || el.nom, 'Office du BAC') as expediteur_nom_complet
        FROM messages m
        JOIN users u ON m.expediteur_id = u.id
        LEFT JOIN etablissements et ON m.etablissement_id = et.id
        LEFT JOIN professeurs p ON p.id = u.id
        LEFT JOIN eleves el ON el.user_id = u.id
        WHERE (m.destinataire_type IN ('PROFESSEUR', 'OFFICE_BAC') AND m.destinataire_id = $1)
           OR (m.destinataire_type = 'ALL_PROFESSEURS')
           OR (m.destinataire_type = 'CLASSE' AND m.destinataire_id IN (
              SELECT c2.id
              FROM (
                SELECT classe_id FROM professeur_matieres WHERE professeur_id = $1
                UNION
                SELECT classe_id FROM emplois_du_temps WHERE professeur_id = $1
              ) pm_classes
              JOIN classes c1 ON pm_classes.classe_id = c1.id
              JOIN classes c2 ON c1.nom = c2.nom AND c1.etablissement_id = c2.etablissement_id
           ))
      `;
      params = [userId];
    } else if (role === 'OFFICE_BAC') {
      query = `
        SELECT m.*, u.email as expediteur_nom, u.role as expediteur_role,
               COALESCE(p.prenom || ' ' || p.nom, el.prenom || ' ' || el.nom, 'Office du BAC') as expediteur_nom_complet
        FROM messages m
        JOIN users u ON m.expediteur_id = u.id
        LEFT JOIN professeurs p ON p.id = u.id
        LEFT JOIN eleves el ON el.user_id = u.id
        WHERE m.destinataire_type = 'OFFICE_BAC' OR m.expediteur_id = $1
      `;
      params = [userId];
    }

    query += ` ORDER BY m.date_envoi DESC`;

    const { rows } = await db.query(query, params);

    // Enrichir dynamiquement avec le badge temporaire "🎖️ Président du Jury N° X" (valide & non expiré)
    for (let msg of rows) {
      if (msg.expediteur_id) {
        const jBadge = await db.query(`
          SELECT numero_jury FROM jurys_bac 
          WHERE president_prof_id = $1 
            AND statut = 'ACTIF' 
            AND (date_expiration_acces IS NULL OR date_expiration_acces >= NOW()) 
          LIMIT 1
        `, [msg.expediteur_id]);

        if (jBadge.rows.length > 0) {
          msg.president_jury_badge = `🎖️ Président du Jury ${jBadge.rows[0].numero_jury}`;
        } else {
          msg.president_jury_badge = null;
        }
      }
    }

    return rows;
  }
};

module.exports = MessageModel;
