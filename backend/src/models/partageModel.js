const db = require('../config/db');

const PartageModel = {
  async getEtablissementIdByAdminId(adminId) {
    const { rows } = await db.query(
      'SELECT id FROM etablissements WHERE admin_id = $1',
      [adminId]
    );
    return rows[0]?.id;
  },

  async shareDocument(data) {
    const {
      expediteurId, destinataireEtablissementId, eleveId, nomFichier, cheminFichier, taille, typeFichier, description
    } = data;

    const { rows } = await db.query(`
      INSERT INTO documents_partages (expediteur_etablissement_id, destinataire_etablissement_id, eleve_id, nom_fichier, chemin_fichier, taille, type_fichier, description)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      expediteurId,
      destinataireEtablissementId || null,
      eleveId || null,
      nomFichier,
      cheminFichier,
      taille,
      typeFichier,
      description || null
    ]);
    return rows[0];
  },

  async getReceivedDocuments(etablissementId) {
    const { rows } = await db.query(`
      SELECT dp.*, e.nom as expediteur_nom, e.ville as expediteur_ville,
             el.nom as eleve_nom, el.prenom as eleve_prenom
      FROM documents_partages dp
      LEFT JOIN etablissements e ON dp.expediteur_etablissement_id = e.id
      LEFT JOIN eleves el ON dp.eleve_id = el.id
      WHERE dp.destinataire_etablissement_id = $1
      ORDER BY dp.date_envoi DESC
    `, [etablissementId]);
    return rows;
  },

  async getSentDocuments(etablissementId) {
    const { rows } = await db.query(`
      SELECT dp.*, e.nom as destinataire_nom, e.ville as destinataire_ville,
             el.nom as eleve_nom, el.prenom as eleve_prenom
      FROM documents_partages dp
      LEFT JOIN etablissements e ON dp.destinataire_etablissement_id = e.id
      LEFT JOIN eleves el ON dp.eleve_id = el.id
      WHERE dp.expediteur_etablissement_id = $1
      ORDER BY dp.date_envoi DESC
    `, [etablissementId]);
    return rows;
  },

  async getDocumentByIdAndEtablissement(docId, etablissementId) {
    const { rows } = await db.query(`
      SELECT * FROM documents_partages WHERE id = $1
        AND (expediteur_etablissement_id = $2 OR destinataire_etablissement_id = $2)
    `, [docId, etablissementId]);
    return rows[0];
  },

  async markAsRead(docId) {
    await db.query('UPDATE documents_partages SET lu = TRUE WHERE id = $1', [docId]);
    return true;
  },

  async deleteDocument(docId) {
    await db.query('DELETE FROM documents_partages WHERE id = $1', [docId]);
    return true;
  }
};

module.exports = PartageModel;
