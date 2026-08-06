const EtablissementModel = require('../models/etablissementModel');
const response = require('../utils/response');
const db = require('../config/db');

const etablissementController = {

  async getAuditLog(req, res) {
    const { classe_id, trimestre, annee_scolaire } = req.query;
    try {
      // Ensure table exists (in case migration hasn't run yet)
      await db.query(`
        CREATE TABLE IF NOT EXISTS historique_notes (
          id SERIAL PRIMARY KEY,
          note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
          ancienne_valeur NUMERIC,
          nouvelle_valeur NUMERIC,
          ancienne_appreciation TEXT,
          nouvelle_appreciation TEXT,
          motif TEXT,
          auteur_id UUID REFERENCES users(id) ON DELETE SET NULL,
          date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          statut VARCHAR(20) DEFAULT 'EN_ATTENTE'
        )
      `);

      let conditions = [];
      let params = [];
      let paramIdx = 1;

      if (req.user.role === 'PROFESSEUR') {
        conditions.push(`hn.auteur_id = $${paramIdx}`);
        params.push(req.user.id);
        paramIdx++;
      } else {
        const etab = await EtablissementModel.getProfileByAdminId(req.user.id);
        if (!etab) return response.error(res, 'Établissement non trouvé.', 404);
        conditions.push(`cl.etablissement_id = $${paramIdx}`);
        params.push(etab.id);
        paramIdx++;
      }

      if (classe_id) {
        conditions.push(`ic.classe_id = $${paramIdx}`);
        params.push(classe_id);
        paramIdx++;
      }
      if (trimestre) {
        conditions.push(`(n.trimestre = $${paramIdx} OR n.semestre = $${paramIdx})`);
        params.push(parseInt(trimestre));
        paramIdx++;
      }
      if (annee_scolaire) {
        conditions.push(`cl.annee_scolaire = $${paramIdx}`);
        params.push(annee_scolaire);
        paramIdx++;
      }

      const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

      const { rows } = await db.query(`
        SELECT
          hn.id,
          hn.note_id,
          hn.ancienne_valeur,
          hn.nouvelle_valeur,
          hn.ancienne_appreciation,
          hn.nouvelle_appreciation,
          hn.motif,
          hn.date_modification,
          hn.statut,
          -- Élève
          el.nom   AS eleve_nom,
          el.prenom AS eleve_prenom,
          -- Classe
          cl.nom   AS classe_nom,
          cl.niveau AS classe_niveau,
          -- Matière
          m.nom    AS matiere_nom,
          -- Note context
          n.trimestre,
          n.semestre,
          n.type_note,
          -- Auteur (professeur)
          p.nom    AS prof_nom,
          p.prenom AS prof_prenom,
          u.email  AS prof_email
        FROM historique_notes hn
        JOIN notes n         ON hn.note_id = n.id
        JOIN eleves el       ON n.eleve_id = el.id
        JOIN inscription_classes ic ON el.id = ic.eleve_id
        JOIN classes cl      ON ic.classe_id = cl.id
        JOIN matieres m      ON n.matiere_id = m.id
        LEFT JOIN professeurs p ON hn.auteur_id = p.id
        LEFT JOIN users u       ON hn.auteur_id = u.id
        ${whereClause}
        ORDER BY hn.date_modification DESC
        LIMIT 500
      `, params);

      return res.json(rows);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la récupération du journal d\'audit.', 500);
    }
  },
  async getProfile(req, res, next) {
    try {
      const profile = await EtablissementModel.getProfileByAdminId(req.user.id);
      if (!profile) {
        return response.error(res, 'Établissement non trouvé.', 404);
      }
      return res.json(profile);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la récupération du profil.', 500);
    }
  },

  async updateProfile(req, res, next) {
    const { nom, region, ville, code_etablissement, nom_directeur } = req.body;
    let signature_url = undefined;
    let cachet_url = undefined;

    if (req.files) {
      if (req.files.signature && req.files.signature[0]) {
        signature_url = `/uploads/etablissements/${req.files.signature[0].filename}`;
      }
      if (req.files.cachet && req.files.cachet[0]) {
        cachet_url = `/uploads/etablissements/${req.files.cachet[0].filename}`;
      }
    }

    try {
      const updatedProfile = await EtablissementModel.updateProfileByAdminId(
        req.user.id, nom, region, ville, code_etablissement, signature_url, cachet_url, nom_directeur
      );
      if (!updatedProfile) {
        return response.error(res, 'Établissement non trouvé.', 404);
      }
      return res.json(updatedProfile);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la mise à jour du profil.', 500);
    }
  },

  async searchEtablissements(req, res, next) {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json([]);
    try {
      const results = await EtablissementModel.searchEtablissements(q);
      return res.json(results);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur de recherche.', 500);
    }
  },

  async getBaremes(req, res) {
    try {
      const db = require('../config/db');
      const etab = await EtablissementModel.getProfileByAdminId(req.user.id);
      if (!etab) return response.error(res, 'Établissement non trouvé.', 404);

      const { rows } = await db.query(
        `SELECT id, note_min, note_max, appreciation, couleur
         FROM baremes_appreciation
         WHERE etablissement_id = $1
         ORDER BY note_min ASC`,
        [etab.id]
      );
      return res.json(rows);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la récupération des barèmes.', 500);
    }
  },

  async saveBaremes(req, res) {
    // baremes = [{ note_min, note_max, appreciation, couleur }, ...]
    const { baremes } = req.body;
    if (!Array.isArray(baremes) || baremes.length === 0) {
      return response.error(res, 'Barèmes invalides.', 400);
    }
    try {
      const db = require('../config/db');
      const etab = await EtablissementModel.getProfileByAdminId(req.user.id);
      if (!etab) return response.error(res, 'Établissement non trouvé.', 404);

      // Delete and re-insert
      await db.query('DELETE FROM baremes_appreciation WHERE etablissement_id = $1', [etab.id]);
      for (const b of baremes) {
        await db.query(
          `INSERT INTO baremes_appreciation (etablissement_id, note_min, note_max, appreciation, couleur)
           VALUES ($1, $2, $3, $4, $5)`,
          [etab.id, b.note_min, b.note_max, b.appreciation, b.couleur || '#64748b']
        );
      }
      return res.json({ message: 'Barèmes sauvegardés avec succès.' });
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la sauvegarde des barèmes.', 500);
    }
  },

  async getAbsencesLog(req, res) {
    const { classe_id, justifiee, date, q } = req.query;
    try {
      const etab = await EtablissementModel.getProfileByAdminId(req.user.id);
      if (!etab) return response.error(res, 'Établissement non trouvé.', 404);

      let conditions = ['cl.etablissement_id = $1'];
      let params = [etab.id];
      let paramIdx = 2;

      if (classe_id) {
        conditions.push(`a.classe_id = $${paramIdx}`);
        params.push(classe_id);
        paramIdx++;
      }

      if (justifiee !== undefined && justifiee !== '') {
        conditions.push(`a.justifiee = $${paramIdx}`);
        params.push(justifiee === 'true');
        paramIdx++;
      }

      if (date) {
        conditions.push(`a.date_absence = $${paramIdx}`);
        params.push(date);
        paramIdx++;
      }

      if (q && q.trim() !== '') {
        conditions.push(`(el.nom ILIKE $${paramIdx} OR el.prenom ILIKE $${paramIdx})`);
        params.push(`%${q.trim()}%`);
        paramIdx++;
      }

      const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

      const { rows } = await db.query(`
        SELECT 
          a.id,
          a.date_absence,
          a.type_presence,
          a.duree_retard,
          a.motif,
          a.justifiee,
          a.motif_justification,
          -- Student info
          el.id as eleve_id,
          el.nom as eleve_nom,
          el.prenom as eleve_prenom,
          -- Class info
          cl.id as classe_id,
          cl.nom as classe_nom,
          -- Subject info
          m.id as matiere_id,
          m.nom as matiere_nom,
          -- Author (professor) info
          p.nom as prof_nom,
          p.prenom as prof_prenom
        FROM absences a
        JOIN eleves el ON a.eleve_id = el.id
        JOIN inscription_classes ic ON el.id = ic.eleve_id
        JOIN classes cl ON ic.classe_id = cl.id
        JOIN matieres m ON a.matiere_id = m.id
        LEFT JOIN professeurs p ON a.professeur_id = p.id
        ${whereClause}
        ORDER BY a.date_absence DESC, el.nom ASC
        LIMIT 500
      `, params);

      return res.json(rows);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la récupération des absences.', 500);
    }
  },

  async justifyAbsence(req, res) {
    const { id } = req.params;
    const { motif_justification } = req.body;
    try {
      const etab = await EtablissementModel.getProfileByAdminId(req.user.id);
      if (!etab) return response.error(res, 'Établissement non trouvé.', 404);

      // Verify that this absence belongs to this establishment
      const { rows: check } = await db.query(`
        SELECT a.id 
        FROM absences a
        JOIN inscription_classes ic ON a.eleve_id = ic.eleve_id
        JOIN classes cl ON ic.classe_id = cl.id
        WHERE a.id = $1 AND cl.etablissement_id = $2
      `, [id, etab.id]);

      if (check.length === 0) {
        return response.error(res, 'Absence non trouvée ou accès refusé.', 403);
      }

      await db.query(`
        UPDATE absences 
        SET justifiee = TRUE, motif_justification = $1 
        WHERE id = $2
      `, [motif_justification || 'Justifié par l\'administration', id]);

      return res.json({ message: 'Absence justifiée avec succès.' });
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la justification de l\'absence.', 500);
    }
  },

  async getProposedDevoirs(req, res) {
    try {
      const etab = await EtablissementModel.getProfileByAdminId(req.user.id);
      if (!etab) return response.error(res, 'Établissement non trouvé.', 404);

      const { rows } = await db.query(
        `SELECT ep.*, c.nom as classe_nom, m.nom as matiere_nom, p.prenom as prof_prenom, p.nom as prof_nom
         FROM examens_planification ep
         JOIN classes c ON ep.classe_id = c.id
         JOIN matieres m ON ep.matiere_id = m.id
         JOIN professeurs p ON ep.professeur_id = p.id
         WHERE ep.etablissement_id = $1 AND ep.statut = 'EN_ATTENTE'
         ORDER BY ep.date_examen ASC`,
        [etab.id]
      );
      return res.json(rows);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la récupération des propositions.', 500);
    }
  },

  async decideProposedDevoir(req, res) {
    const { id } = req.params;
    const { action } = req.body; // 'VALIDER' | 'REFUSER'
    if (!action || (action !== 'VALIDER' && action !== 'REFUSER')) {
      return response.error(res, 'Action invalide.', 400);
    }
    try {
      const etab = await EtablissementModel.getProfileByAdminId(req.user.id);
      if (!etab) return response.error(res, 'Établissement non trouvé.', 404);

      const { rows: check } = await db.query(
        `SELECT ep.*, c.nom as classe_nom, m.nom as matiere_nom
         FROM examens_planification ep
         JOIN classes c ON ep.classe_id = c.id
         JOIN matieres m ON ep.matiere_id = m.id
         WHERE ep.id = $1 AND ep.etablissement_id = $2`,
        [id, etab.id]
      );
      if (check.length === 0) {
        return response.error(res, 'Proposition non trouvée ou accès refusé.', 404);
      }

      const prop = check[0];
      const newStatus = action === 'VALIDER' ? 'VALIDE' : 'REFUSE';

      await db.query(
        `UPDATE examens_planification SET statut = $1 WHERE id = $2`,
        [newStatus, id]
      );

      if (prop.professeur_id) {
        const notifTitle = action === 'VALIDER' ? 'Proposition de devoir validée' : 'Proposition de devoir refusée';
        const notifDesc = action === 'VALIDER'
          ? `L'administrateur a validé votre devoir pour la classe ${prop.classe_nom} (${prop.matiere_nom}) le ${new Date(prop.date_examen).toLocaleDateString('fr-FR')}.`
          : `L'administrateur a refusé votre proposition de devoir pour la classe ${prop.classe_nom} (${prop.matiere_nom}) le ${new Date(prop.date_examen).toLocaleDateString('fr-FR')}.`;

        await db.query(
          `INSERT INTO notifications (user_id, titre, description, type, lu)
           VALUES ($1, $2, $3, 'PLANNING', FALSE)`,
          [prop.professeur_id, notifTitle, notifDesc]
        );
      }

      return res.json({ message: `Proposition traitée avec succès (${newStatus}).` });
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors du traitement de la proposition.', 500);
    }
  },

  async confirmAuditLog(req, res) {
    const { id } = req.params;
    try {
      const client = await db.pool.connect();
      try {
        await client.query('BEGIN');
        
        // 1. Fetch modification details
        const auditRes = await client.query('SELECT * FROM historique_notes WHERE id = $1', [id]);
        if (auditRes.rows.length === 0) {
          client.release();
          return response.error(res, 'Demande de modification non trouvée.', 404);
        }
        const auditLog = auditRes.rows[0];

        if (auditLog.statut !== 'EN_ATTENTE') {
          client.release();
          return response.error(res, 'Cette demande a déjà été traitée.', 400);
        }

        // 2. Apply change to the notes table
        await client.query(
          `UPDATE notes 
           SET valeur = $1, appreciation = $2 
           WHERE id = $3`,
          [auditLog.nouvelle_valeur, auditLog.nouvelle_appreciation || null, auditLog.note_id]
        );

        // 3. Mark request as CONFIRME
        await client.query(
          `UPDATE historique_notes 
           SET statut = 'CONFIRME' 
           WHERE id = $1`,
          [id]
        );

        await client.query('COMMIT');
        client.release();
        return res.json({ message: 'Modification de la note validée et appliquée avec succès.' });
      } catch (err) {
        await client.query('ROLLBACK');
        client.release();
        throw err;
      }
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la confirmation de la modification.', 500);
    }
  },

  async rejectAuditLog(req, res) {
    const { id } = req.params;
    try {
      // 1. Fetch modification details
      const auditRes = await db.query('SELECT * FROM historique_notes WHERE id = $1', [id]);
      if (auditRes.rows.length === 0) {
        return response.error(res, 'Demande de modification non trouvée.', 404);
      }
      const auditLog = auditRes.rows[0];

      if (auditLog.statut !== 'EN_ATTENTE') {
        return response.error(res, 'Cette demande a déjà été traitée.', 400);
      }

      // 2. Mark request as REJETE
      await db.query(
        `UPDATE historique_notes 
         SET statut = 'REJETE' 
         WHERE id = $1`,
        [id]
      );

      return res.json({ message: 'Demande de modification rejetée.' });
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors du rejet de la modification.', 500);
    }
  }
};

module.exports = etablissementController;
