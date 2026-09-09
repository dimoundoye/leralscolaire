const db = require('../config/db');

const ProfModel = {
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

  async listProfesseurs(etablissementId) {
    const { rows } = await db.query(`
      SELECT u.id, u.email, u.identifiant_national, p.nom, p.prenom, p.telephone, p.matiere_principale, pe.statut, pe.date_invitation, pe.droit_envoi_message
      FROM users u
      LEFT JOIN professeurs p ON u.id = p.id
      JOIN professeurs_etablissements pe ON u.id = pe.professeur_id
      WHERE pe.etablissement_id = $1 AND u.role = 'PROFESSEUR'
      ORDER BY p.nom ASC, p.prenom ASC
    `, [etablissementId]);
    return rows;
  },


  async checkUserExists(email) {
    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return rows.length > 0;
  },

  async createProfUser(email, passwordHash, identifiantNational = null, tempPassword = null, client = db) {
    const { rows } = await client.query(
      "INSERT INTO users (email, password_hash, role, identifiant_national, password_provisoire) VALUES ($1, $2, 'PROFESSEUR', $3, $4) RETURNING id",
      [email, passwordHash, identifiantNational, tempPassword]
    );
    return rows[0]?.id;
  },

  async linkProfToEtablissement(profId, etablissementId, client = db) {
    await client.query(
      `INSERT INTO professeurs_etablissements (professeur_id, etablissement_id, statut, date_invitation) 
       VALUES ($1, $2, 'EN_ATTENTE', CURRENT_TIMESTAMP)
       ON CONFLICT (professeur_id, etablissement_id) DO UPDATE SET statut = 'EN_ATTENTE', date_invitation = CURRENT_TIMESTAMP`,
      [profId, etablissementId]
    );
    return true;
  },

  async updateProfUser(profId, email, passwordHash = null) {
    let query = 'UPDATE users SET email = $1';
    let params = [email];
    
    if (passwordHash) {
      query += ', password_hash = $2 WHERE id = $3';
      params.push(passwordHash, profId);
    } else {
      query += ' WHERE id = $2';
      params.push(profId);
    }
    
    const { rows } = await db.query(query + ' RETURNING id, email', params);
    return rows[0];
  },

  async unlinkProfFromEtablissement(profId, etablissementId) {
    await db.query(
      'DELETE FROM professeurs_etablissements WHERE professeur_id = $1 AND etablissement_id = $2',
      [profId, etablissementId]
    );
    return true;
  },

  // -------------------------------------------------------------
  // NEW METHODS FOR PHASE 4 (TEACHER PORTAL & SEARCH/INVITATIONS)
  // -------------------------------------------------------------

  async findProfByIdentifiant(identifiant) {
    const { rows } = await db.query(
      `SELECT u.id, u.email, u.identifiant_national, p.nom, p.prenom, p.telephone, p.photo_url, p.matiere_principale
       FROM users u
       LEFT JOIN professeurs p ON u.id = p.id
       WHERE u.identifiant_national = $1 AND u.role = 'PROFESSEUR'`,
      [identifiant]
    );
    return rows[0];
  },

  async findProfById(profId) {
    const { rows } = await db.query(
      `SELECT u.id, u.email, u.identifiant_national, p.nom, p.prenom, p.telephone, p.photo_url, p.matiere_principale,
              COALESCE(p.sexe, 'M') as sexe
       FROM users u
       LEFT JOIN professeurs p ON u.id = p.id
       WHERE u.id = $1 AND u.role = 'PROFESSEUR'`,
      [profId]
    );
    return rows[0];
  },

  async toggleMessagePermission(profId, etablissementId, value) {
    await db.query(
      `UPDATE professeurs_etablissements 
       SET droit_envoi_message = $1 
       WHERE professeur_id = $2 AND etablissement_id = $3`,
      [value, profId, etablissementId]
    );
    return true;
  },


  async getInvitations(profId) {
    const { rows } = await db.query(
      `SELECT pe.etablissement_id, pe.statut, pe.date_invitation, et.nom as etablissement_nom, et.ville, et.region
       FROM professeurs_etablissements pe
       JOIN etablissements et ON pe.etablissement_id = et.id
       WHERE pe.professeur_id = $1 AND pe.statut = 'EN_ATTENTE'
       ORDER BY pe.date_invitation DESC`,
      [profId]
    );
    return rows;
  },

  async respondToInvitation(profId, etablissementId, accept) {
    const status = accept ? 'ACCEPTE' : 'REFUSE';
    const { rows } = await db.query(
      `UPDATE professeurs_etablissements
       SET statut = $1, date_reponse = CURRENT_TIMESTAMP
       WHERE professeur_id = $2 AND etablissement_id = $3 RETURNING *`,
      [status, profId, etablissementId]
    );
    return rows[0];
  },

  async getAffiliations(profId) {
    const { rows } = await db.query(
      `SELECT pe.etablissement_id, pe.statut, pe.date_reponse, et.nom as etablissement_nom, et.ville, et.region
       FROM professeurs_etablissements pe
       JOIN etablissements et ON pe.etablissement_id = et.id
       WHERE pe.professeur_id = $1 AND pe.statut = 'ACCEPTE'
       ORDER BY et.nom ASC`,
      [profId]
    );
    return rows;
  },

  async getConsolidatedSchedule(profId) {
    const { rows } = await db.query(
      `SELECT edt.id, edt.classe_id, edt.matiere_id, edt.jour_semaine, edt.heure_debut, edt.heure_fin, edt.salle,
              c.nom as classe_nom, c.niveau, c.annee_scolaire, m.nom as matiere_nom, et.nom as etablissement_nom, et.id as etablissement_id
       FROM emplois_du_temps edt
       JOIN classes c ON edt.classe_id = c.id
       JOIN matieres m ON edt.matiere_id = m.id
       JOIN etablissements et ON c.etablissement_id = et.id
       JOIN professeurs_etablissements pe ON pe.etablissement_id = et.id AND pe.professeur_id = edt.professeur_id
       WHERE edt.professeur_id = $1 AND pe.statut = 'ACCEPTE'
       ORDER BY 
         CASE edt.jour_semaine 
           WHEN 'Lundi' THEN 1
           WHEN 'Mardi' THEN 2
           WHEN 'Mercredi' THEN 3
           WHEN 'Jeudi' THEN 4
           WHEN 'Vendredi' THEN 5
           WHEN 'Samedi' THEN 6
           WHEN 'Dimanche' THEN 7
           ELSE 8
         END, edt.heure_debut`,
      [profId]
    );
    return rows;
  },

  async checkScheduleConflict(profId, jourSemaine, heureDebut, heureFin, excludeId = null) {
    let query = `
      SELECT edt.id, edt.jour_semaine, edt.heure_debut, edt.heure_fin,
             c.nom as classe_nom, et.nom as etablissement_nom
      FROM emplois_du_temps edt
      JOIN classes c ON edt.classe_id = c.id
      JOIN etablissements et ON c.etablissement_id = et.id
      WHERE edt.professeur_id = $1 
        AND edt.jour_semaine = $2
        AND (
          (edt.heure_debut, edt.heure_fin) OVERLAPS ($3::TIME, $4::TIME)
        )
    `;
    const params = [profId, jourSemaine, heureDebut, heureFin];
    if (excludeId) {
      query += ` AND edt.id != $5`;
      params.push(excludeId);
    }
    const { rows } = await db.query(query, params);
    return rows;
  },

  async getAvailableSlots(profId, jourSemaine) {
    const standardSlots = [
      { start: '08:00:00', end: '10:00:00', label: '08h00 - 10h00' },
      { start: '10:00:00', end: '12:00:00', label: '10h00 - 12h00' },
      { start: '12:00:00', end: '14:00:00', label: '12h00 - 14h00' },
      { start: '15:00:00', end: '17:00:00', label: '15h00 - 17h00' },
      { start: '17:00:00', end: '19:00:00', label: '17h00 - 19h00' }
    ];

    const { rows: occupied } = await db.query(
      `SELECT heure_debut, heure_fin 
       FROM emplois_du_temps 
       WHERE professeur_id = $1 AND jour_semaine = $2`,
      [profId, jourSemaine]
    );

    const freeSlots = standardSlots.filter(std => {
      const [stdSh, stdSm] = std.start.split(':').map(Number);
      const [stdEh, stdEm] = std.end.split(':').map(Number);
      const stdStart = stdSh * 60 + stdSm;
      const stdEnd = stdEh * 60 + stdEm;

      return !occupied.some(occ => {
        const [occSh, occSm] = occ.heure_debut.split(':').map(Number);
        const [occEh, occEm] = occ.heure_fin.split(':').map(Number);
        const occStart = occSh * 60 + occSm;
        const occEnd = occEh * 60 + occEm;

        return (stdStart < occEnd && stdEnd > occStart);
      });
    });

    return freeSlots.map(s => s.label);
  },

  async getTeacherClasses(profId) {
    const { rows } = await db.query(
      `SELECT DISTINCT c2.id as classe_id, pm_mat.matiere_id, c2.nom as classe_nom, c2.niveau, c2.annee_scolaire, m.nom as matiere_nom, et.nom as etablissement_nom, et.id as etablissement_id
       FROM (
         SELECT classe_id, matiere_id FROM professeur_matieres WHERE professeur_id = $1
         UNION
         SELECT classe_id, matiere_id FROM emplois_du_temps WHERE professeur_id = $1
       ) AS pm_mat
       JOIN classes c1 ON pm_mat.classe_id = c1.id
       JOIN matieres m ON pm_mat.matiere_id = m.id
       JOIN classes c2 ON c1.nom = c2.nom AND c1.etablissement_id = c2.etablissement_id
       JOIN etablissements et ON c2.etablissement_id = et.id
       JOIN professeurs_etablissements pe ON pe.etablissement_id = et.id AND pe.professeur_id = $1
       WHERE pe.statut = 'ACCEPTE'
       ORDER BY etablissement_nom ASC, c2.annee_scolaire DESC, c2.nom ASC, m.nom ASC`,
      [profId]
    );
    return rows;
  },

  async getClassStudentsForTeacher(classeId) {
    const { rows } = await db.query(
      `SELECT e.id, e.nom, e.prenom, e.identifiant_national, e.photo_url
       FROM eleves e
       JOIN inscription_classes ic ON e.id = ic.eleve_id
       WHERE ic.classe_id = $1
       ORDER BY e.nom ASC, e.prenom ASC`,
      [classeId]
    );
    return rows;
  },

  async getDashboardSummary(profId) {
    // 1. Get affiliations count
    const affs = await this.getAffiliations(profId);
    const schoolsCount = affs.length;

    // 2. Get active classes count
    const classes = await this.getTeacherClasses(profId);
    const classesCount = classes.length;

    // 3. Get total students count taught by teacher
    let studentsCount = 0;
    if (classes.length > 0) {
      const classIds = classes.map(c => c.classe_id);
      const { rows } = await db.query(
        `SELECT COUNT(DISTINCT eleve_id) as count 
         FROM inscription_classes 
         WHERE classe_id = ANY($1)`,
        [classIds]
      );
      studentsCount = parseInt(rows[0]?.count || 0);
    }

    return {
      schoolsCount,
      classesCount,
      studentsCount
    };
  },

  async getDashboardDetails(profId) {
    // 1. Get profile
    const profile = await this.findProfById(profId);

    // 2. Get affiliations
    const { rows: affiliations } = await db.query(
      `SELECT pe.etablissement_id, pe.statut, pe.date_invitation, pe.date_reponse,
              et.nom as etablissement_nom, et.region, et.ville
       FROM professeurs_etablissements pe
       JOIN etablissements et ON pe.etablissement_id = et.id
       WHERE pe.professeur_id = $1
       ORDER BY pe.statut ASC, et.nom ASC`,
      [profId]
    );

    // 3. Get classes taught
    const classes = await this.getTeacherClasses(profId);

    // Get student count per class
    const { rows: studentCounts } = await db.query(
      `SELECT ic.classe_id, COUNT(DISTINCT ic.eleve_id) as count
       FROM inscription_classes ic
       GROUP BY ic.classe_id`
    );
    const studentCountsMap = {};
    studentCounts.forEach(r => {
      studentCountsMap[r.classe_id] = parseInt(r.count || 0);
    });

    // Get note entries per class, subject, period
    const { rows: noteCounts } = await db.query(
      `SELECT ic.classe_id, n.matiere_id, n.trimestre, n.semestre, n.eleve_id, n.valeur
       FROM notes n
       JOIN inscription_classes ic ON n.eleve_id = ic.eleve_id
       WHERE n.matiere_id IN (
         SELECT pm.matiere_id FROM professeur_matieres pm WHERE pm.professeur_id = $1
         UNION
         SELECT edt.matiere_id FROM emplois_du_temps edt WHERE edt.professeur_id = $1
       )`,
      [profId]
    );

    // Map counts and compute averages back to classes
    const classesWithStats = classes.map(c => {
      const totalStudents = studentCountsMap[c.classe_id] || 0;
      
      // Filter note entries for this class and subject
      const entries = noteCounts.filter(n => n.classe_id === c.classe_id && n.matiere_id === c.matiere_id);
      
      const validNotes = entries.filter(n => n.valeur !== null && n.valeur !== undefined);
      const avgGrade = validNotes.length > 0 
        ? Math.round((validNotes.reduce((acc, curr) => acc + parseFloat(curr.valeur), 0) / validNotes.length) * 100) / 100 
        : null;

      // Let's compute rates per period (S1, S2)
      const periodStats = {};
      [1, 2].forEach(pNum => {
        const pEntries = entries.filter(n => n.trimestre === pNum || n.semestre === pNum);
        const validPeriodNotes = pEntries.filter(n => n.valeur !== null && n.valeur !== undefined);
        const periodAvg = validPeriodNotes.length > 0 
          ? Math.round((validPeriodNotes.reduce((acc, curr) => acc + parseFloat(curr.valeur), 0) / validPeriodNotes.length) * 100) / 100 
          : null;
        
        const totalEntered = pEntries.length;
        const expected = totalStudents * 2;
        const rate = expected > 0 ? Math.round((totalEntered / expected) * 100) : 100;
        
        periodStats[`S${pNum}`] = {
          entered: totalEntered,
          expected: expected,
          rate: rate,
          average: periodAvg
        };
      });

      return {
        ...c,
        total_students: totalStudents,
        period_stats: periodStats,
        moyenne_matiere: avgGrade,
        total_notes: validNotes.length
      };
    });

    // 4. Get unread messages count
    const { rows: msgRes } = await db.query(
      `SELECT COUNT(*) as count
       FROM messages m
        WHERE m.lu = FALSE
          AND m.expediteur_id != $1
          AND (
            (m.destinataire_type = 'CLASSE' AND m.destinataire_id IN (
              SELECT c2.id
              FROM (
                SELECT classe_id FROM professeur_matieres WHERE professeur_id = $1
                UNION
                SELECT classe_id FROM emplois_du_temps WHERE professeur_id = $1
              ) AS pm_classes
              JOIN classes c1 ON pm_classes.classe_id = c1.id
              JOIN classes c2 ON c1.nom = c2.nom AND c1.etablissement_id = c2.etablissement_id
            ))
            OR (m.destinataire_type = 'PROFESSEUR' AND m.destinataire_id = $1)
          )`,
      [profId]
    );
    const unreadMessagesCount = parseInt(msgRes[0]?.count || 0);

    // 5. Get pending exams (exams scheduled with missing grades)
    const { rows: exams } = await db.query(
      `SELECT 
         ep.id, ep.date_examen, ep.type_examen, ep.salle, ep.classe_id, ep.matiere_id,
         c.nom as classe_nom, m.nom as matiere_nom, et.nom as etablissement_nom,
         (SELECT COUNT(*) FROM inscription_classes WHERE classe_id = ep.classe_id) as total_students,
         (
           SELECT COUNT(DISTINCT n.eleve_id) 
           FROM notes n 
           JOIN inscription_classes ic ON n.eleve_id = ic.eleve_id
           WHERE ic.classe_id = ep.classe_id 
             AND n.matiere_id = ep.matiere_id 
             AND n.type_note = ep.type_examen
         ) as entered_students
       FROM examens_planification ep
       JOIN classes c ON ep.classe_id = c.id
       JOIN matieres m ON ep.matiere_id = m.id
       JOIN etablissements et ON ep.etablissement_id = et.id
       WHERE (ep.classe_id, ep.matiere_id) IN (
         SELECT pm.classe_id, pm.matiere_id FROM professeur_matieres pm WHERE pm.professeur_id = $1
         UNION
         SELECT edt.classe_id, edt.matiere_id FROM emplois_du_temps edt WHERE edt.professeur_id = $1
       )
       AND ep.date_examen <= NOW() + INTERVAL '7 days'
       ORDER BY ep.date_examen DESC`,
      [profId]
    );

    // Filter pending exams (where entered grades < total students)
    const pendingExams = exams
      .map(e => ({
        ...e,
        total_students: parseInt(e.total_students || 0),
        entered_students: parseInt(e.entered_students || 0)
      }))
      .filter(e => e.entered_students < e.total_students);

    return {
      profile,
      affiliations,
      classes: classesWithStats,
      alerts: {
        unreadMessagesCount,
        pendingExams
      }
    };
  },

  async toggleMessagePermission(profId, etablissementId, permissionValue) {
    await db.query(`
      UPDATE professeurs_etablissements 
      SET droit_envoi_message = $1 
      WHERE professeur_id = $2 AND etablissement_id = $3
    `, [permissionValue, profId, etablissementId]);
    return true;
  }
};

module.exports = ProfModel;

