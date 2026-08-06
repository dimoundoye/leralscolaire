const db = require('../config/db');

class DisciplineModel {
  static async createSignalement(data) {
    const {
      etablissement_id,
      eleve_id,
      auteur_id,
      auteur_type,
      type_action,
      gravite,
      matiere_code,
      matiere_nom,
      motif,
      description,
      date_rendez_vous,
      lieu_rendez_vous,
      notifie_email,
      notifie_sms
    } = data;

    const query = `
      INSERT INTO signalements_discipline (
        etablissement_id, eleve_id, auteur_id, auteur_type,
        type_action, gravite, matiere_code, matiere_nom,
        motif, description, date_rendez_vous, lieu_rendez_vous,
        notifie_email, notifie_sms
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *;
    `;

    const values = [
      etablissement_id, eleve_id, auteur_id, auteur_type || 'PROFESSEUR',
      type_action, gravite || 'INFO', matiere_code || null, matiere_nom || null,
      motif, description || null, date_rendez_vous || null, lieu_rendez_vous || null,
      notifie_email || false, notifie_sms || false
    ];

    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async getByEtablissement(etablissementId, filters = {}) {
    let query = `
      SELECT s.*, 
             e.nom as eleve_nom, e.prenom as eleve_prenom, e.identifiant_national as eleve_ine,
             c.nom as classe_nom,
             COALESCE(p.prenom || ' ' || p.nom, u.email, 'Administration') as auteur_nom_complet
      FROM signalements_discipline s
      JOIN eleves e ON s.eleve_id = e.id
      LEFT JOIN inscription_classes ic ON e.id = ic.eleve_id
      LEFT JOIN classes c ON ic.classe_id = c.id
      LEFT JOIN users u ON s.auteur_id = u.id
      LEFT JOIN professeurs p ON p.id = u.id OR p.user_id = u.id
      WHERE s.etablissement_id = $1
    `;
    const params = [etablissementId];

    if (filters.type_action) {
      params.push(filters.type_action);
      query += ` AND s.type_action = $${params.length}`;
    }
    if (filters.statut) {
      params.push(filters.statut);
      query += ` AND s.statut = $${params.length}`;
    }

    query += ` ORDER BY s.created_at DESC`;

    const { rows } = await db.query(query, params);
    return rows;
  }

  static async getByProfesseur(auteurId, etablissementId) {
    const query = `
      SELECT s.*, 
             e.nom as eleve_nom, e.prenom as eleve_prenom, e.identifiant_national as eleve_ine,
             c.nom as classe_nom
      FROM signalements_discipline s
      JOIN eleves e ON s.eleve_id = e.id
      LEFT JOIN inscription_classes ic ON e.id = ic.eleve_id
      LEFT JOIN classes c ON ic.classe_id = c.id
      WHERE s.auteur_id = $1 AND s.etablissement_id = $2
      ORDER BY s.created_at DESC
    `;
    const { rows } = await db.query(query, [auteurId, etablissementId]);
    return rows;
  }

  static async getByEleve(eleveId, isStudentView = false) {
    const query = `
      SELECT s.*, 
             e.nom as eleve_nom, e.prenom as eleve_prenom,
             COALESCE(p.prenom || ' ' || p.nom, u.email, 'Administration') as auteur_nom_complet
      FROM signalements_discipline s
      JOIN eleves e ON s.eleve_id = e.id
      LEFT JOIN users u ON s.auteur_id = u.id
      LEFT JOIN professeurs p ON p.id = u.id OR p.user_id = u.id
      WHERE s.eleve_id = $1
      ORDER BY s.created_at DESC
    `;
    const { rows } = await db.query(query, [eleveId]);

    if (isStudentView) {
      return rows.map(r => ({
        ...r,
        // Masquer le nom complet du prof pour l'élève si c'est un enseignant
        auteur_nom_complet: r.auteur_type === 'PROFESSEUR'
          ? (r.matiere_nom ? `Professeur de ${r.matiere_nom}` : 'Professeur')
          : 'Administration / Établissement'
      }));
    }

    return rows;
  }

  static async updateStatut(id, statut, compteRenduRdv = null) {
    const query = `
      UPDATE signalements_discipline
      SET statut = $1,
          compte_rendu_rdv = COALESCE($2, compte_rendu_rdv),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *;
    `;
    const { rows } = await db.query(query, [statut, compteRenduRdv, id]);
    return rows[0];
  }

  static async getEleveDossierComplet(eleveId) {
    // Infos élève + classe + établissement
    const eleveQuery = `
      SELECT e.*, c.nom as classe_nom, et.nom as etablissement_nom, et.region, et.ville
      FROM eleves e
      LEFT JOIN etablissements et ON e.etablissement_id = et.id
      LEFT JOIN inscription_classes ic ON e.id = ic.eleve_id
      LEFT JOIN classes c ON ic.classe_id = c.id
      WHERE e.id = $1
      LIMIT 1
    `;
    const { rows: eleveRows } = await db.query(eleveQuery, [eleveId]);
    if (eleveRows.length === 0) return null;

    const eleveData = eleveRows[0];
    const signalements = await this.getByEleve(eleveId, false);

    return {
      eleve: eleveData,
      signalements: signalements
    };
  }
}

module.exports = DisciplineModel;
