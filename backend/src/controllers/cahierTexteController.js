const db = require('../config/db');
const response = require('../utils/response');

const cahierTexteController = {
  async uploadFile(req, res, next) {
    try {
      if (!req.file) {
        return response.error(res, 'Aucun fichier fourni.', 400);
      }
      const { getUploadedFileUrl } = require('../config/cloudinary');
      const fichier_url = getUploadedFileUrl(req.file, 'cahier_texte');
      return res.json({
        fichier_url,
        fichier_nom: req.file.originalname
      });
    } catch (err) {
      console.error(err);
      return response.error(res, "Erreur lors de l'envoi du support de cours.", 500);
    }
  },

  // 1. Saisie d'une fiche de cours / séance par le professeur
  async createEntry(req, res) {
    const {
      classe_id,
      matiere_id,
      date_seance,
      heure_debut,
      heure_fin,
      titre_lecon,
      contenu_seance,
      travail_a_faire,
      date_remise_devoir,
      fichier_url,
      fichier_nom
    } = req.body;

    if (!classe_id || !matiere_id || !titre_lecon || !contenu_seance) {
      return response.error(res, 'Veuillez remplir la classe, la matière, le titre et le contenu de la leçon.', 400);
    }

    try {
      // Fetch etablissement_id from class
      const classRes = await db.query('SELECT etablissement_id FROM classes WHERE id = $1', [classe_id]);
      if (classRes.rows.length === 0) {
        return response.error(res, 'Classe non trouvée.', 404);
      }
      const etablissement_id = classRes.rows[0].etablissement_id;

      const { rows } = await db.query(
        `INSERT INTO cahier_de_texte (
          etablissement_id, classe_id, matiere_id, professeur_id,
          date_seance, heure_debut, heure_fin, titre_lecon, contenu_seance,
          travail_a_faire, date_remise_devoir, fichier_url, fichier_nom
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *`,
        [
          etablissement_id,
          classe_id,
          matiere_id,
          req.user.id,
          date_seance || new Date(),
          heure_debut || null,
          heure_fin || null,
          titre_lecon,
          contenu_seance,
          travail_a_faire || null,
          date_remise_devoir || null,
          fichier_url || null,
          fichier_nom || null
        ]
      );

      return res.status(201).json({
        message: 'Séance enregistrée avec succès dans le Cahier de Texte.',
        entry: rows[0]
      });
    } catch (err) {
      console.error('Erreur création cahier de texte:', err);
      return response.error(res, 'Erreur lors de l\'enregistrement de la séance.', 500);
    }
  },

  // 2. Upload d'un fichier support de cours pour le cahier de texte
  async uploadFile(req, res) {
    try {
      if (!req.file) {
        return response.error(res, 'Aucun fichier sélectionné.', 400);
      }
      const fichierUrl = `/uploads/cahier_texte/${req.file.filename}`;
      return res.json({
        fichier_url: fichierUrl,
        fichier_nom: req.file.originalname
      });
    } catch (err) {
      console.error('Erreur upload support cahier de texte:', err);
      return response.error(res, 'Erreur lors du téléchargement du fichier.', 500);
    }
  },

  // 3. Récupération des séances pour un Professeur
  async getProfesseurEntries(req, res) {
    const { classe_id, matiere_id } = req.query;
    try {
      let query = `
        SELECT ct.*, c.nom as classe_nom, c.annee_scolaire, m.nom as matiere_nom, m.code_matiere
        FROM cahier_de_texte ct
        JOIN classes c ON ct.classe_id = c.id
        JOIN matieres m ON ct.matiere_id = m.id
        WHERE ct.professeur_id = $1
      `;
      const params = [req.user.id];

      if (classe_id) {
        params.push(classe_id);
        query += ` AND ct.classe_id = $${params.length}`;
      }

      if (matiere_id) {
        params.push(matiere_id);
        query += ` AND ct.matiere_id = $${params.length}`;
      }

      query += ` ORDER BY ct.date_seance DESC, ct.created_at DESC`;

      const { rows } = await db.query(query, params);
      return res.json(rows);
    } catch (err) {
      console.error('Erreur récupération cahier de texte prof:', err);
      return response.error(res, 'Erreur lors du chargement du cahier de texte.', 500);
    }
  },

  // 4. Récupération des séances et devoirs pour un Élève
  async getEleveEntries(req, res) {
    try {
      // Find student eleve_id
      const eleveRes = await db.query('SELECT id FROM eleves WHERE user_id = $1', [req.user.id]);
      if (eleveRes.rows.length === 0) {
        return response.error(res, 'Élève non trouvé.', 404);
      }
      const eleveId = eleveRes.rows[0].id;

      // Find all enrolled classes of the student
      const classRes = await db.query('SELECT classe_id FROM inscription_classes WHERE eleve_id = $1', [eleveId]);
      const classIds = classRes.rows.map(r => r.classe_id);

      if (classIds.length === 0) {
        // Fallback : renvoyer les séances récentes de l'établissement
        const { rows: fallbackRows } = await db.query(
          `SELECT ct.*, c.nom as classe_nom, c.annee_scolaire, m.nom as matiere_nom, m.code_matiere,
                  COALESCE(p.prenom || ' ' || p.nom, u.email) as professeur_nom
           FROM cahier_de_texte ct
           JOIN classes c ON ct.classe_id = c.id
           JOIN matieres m ON ct.matiere_id = m.id
           JOIN users u ON ct.professeur_id = u.id
           LEFT JOIN professeurs p ON p.id = u.id
           ORDER BY ct.date_seance DESC, ct.created_at DESC
           LIMIT 50`
        );
        return res.json(fallbackRows);
      }

      const { rows } = await db.query(
        `SELECT ct.*, c.nom as classe_nom, c.annee_scolaire, m.nom as matiere_nom, m.code_matiere,
                COALESCE(p.prenom || ' ' || p.nom, u.email) as professeur_nom
         FROM cahier_de_texte ct
         JOIN classes c ON ct.classe_id = c.id
         JOIN matieres m ON ct.matiere_id = m.id
         JOIN users u ON ct.professeur_id = u.id
         LEFT JOIN professeurs p ON p.id = u.id
         WHERE ct.classe_id = ANY($1::uuid[])
         ORDER BY ct.date_seance DESC, ct.created_at DESC`,
        [classIds]
      );

      return res.json(rows);
    } catch (err) {
      console.error('Erreur récupération cahier de texte élève:', err);
      return response.error(res, 'Erreur lors du chargement du cahier de texte.', 500);
    }
  },

  // 5. Récupération pour l'Administration de l'établissement
  async getAdminEntries(req, res) {
    const { classe_id, professeur_id } = req.query;
    try {
      // Find admin's establishment
      const etabRes = await db.query('SELECT id FROM etablissements WHERE admin_id = $1', [req.user.id]);
      if (etabRes.rows.length === 0) {
        return response.error(res, 'Établissement non trouvé.', 404);
      }
      const etablissementId = etabRes.rows[0].id;

      let query = `
        SELECT ct.*, c.nom as classe_nom, c.annee_scolaire, m.nom as matiere_nom, m.code_matiere,
                COALESCE(p.prenom || ' ' || p.nom, u.email) as professeur_nom
         FROM cahier_de_texte ct
         JOIN classes c ON ct.classe_id = c.id
         JOIN matieres m ON ct.matiere_id = m.id
         JOIN users u ON ct.professeur_id = u.id
         LEFT JOIN professeurs p ON p.id = u.id
         WHERE ct.etablissement_id = $1
      `;
      const params = [etablissementId];

      if (classe_id) {
        params.push(classe_id);
        query += ` AND ct.classe_id = $${params.length}`;
      }

      if (professeur_id) {
        params.push(professeur_id);
        query += ` AND ct.professeur_id = $${params.length}`;
      }

      query += ` ORDER BY ct.date_seance DESC, ct.created_at DESC`;

      const { rows } = await db.query(query, params);
      return res.json(rows);
    } catch (err) {
      console.error('Erreur récupération cahier de texte admin:', err);
      return response.error(res, 'Erreur lors du chargement des cahiers de texte.', 500);
    }
  },

  // 6. Visa administratif de contrôle du cahier de texte
  async toggleAdminVisa(req, res) {
    const { id } = req.params;
    try {
      const entryRes = await db.query('SELECT visa_admin FROM cahier_de_texte WHERE id = $1', [id]);
      if (entryRes.rows.length === 0) {
        return response.error(res, 'Fiche non trouvée.', 404);
      }

      const currentVisa = entryRes.rows[0].visa_admin;
      const newVisa = !currentVisa;

      const { rows } = await db.query(
        `UPDATE cahier_de_texte
         SET visa_admin = $1, date_visa = $2, updated_at = NOW()
         WHERE id = $3
         RETURNING *`,
        [newVisa, newVisa ? new Date() : null, id]
      );

      return res.json({
        message: newVisa ? 'Visa administratif apposé.' : 'Visa administratif retiré.',
        entry: rows[0]
      });
    } catch (err) {
      console.error('Erreur visa cahier de texte:', err);
      return response.error(res, 'Erreur lors de la mise à jour du visa.', 500);
    }
  },

  // 7. Suppression d'une fiche par l'enseignant ou l'administration
  async deleteEntry(req, res) {
    const { id } = req.params;
    try {
      const entryRes = await db.query('SELECT * FROM cahier_de_texte WHERE id = $1', [id]);
      if (entryRes.rows.length === 0) {
        return response.error(res, 'Fiche non trouvée.', 404);
      }

      const entry = entryRes.rows[0];
      if (req.user.role === 'PROFESSEUR' && entry.professeur_id !== req.user.id) {
        return response.error(res, 'Seul l\'auteur de la séance peut la supprimer.', 403);
      }

      await db.query('DELETE FROM cahier_de_texte WHERE id = $1', [id]);
      return res.json({ message: 'Séance supprimée du cahier de texte.' });
    } catch (err) {
      console.error('Erreur suppression cahier de texte:', err);
      return response.error(res, 'Erreur lors de la suppression de la séance.', 500);
    }
  }
};

module.exports = cahierTexteController;
