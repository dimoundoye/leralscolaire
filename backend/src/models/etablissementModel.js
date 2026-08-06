const db = require('../config/db');

const EtablissementModel = {
  async getProfileByAdminId(adminId) {
    const { rows } = await db.query(
      'SELECT * FROM etablissements WHERE admin_id = $1',
      [adminId]
    );
    return rows[0];
  },

  async updateProfileByAdminId(adminId, nom, region, ville, codeEtablissement, signature_url, cachet_url, nomDirecteur) {
    let query = 'UPDATE etablissements SET nom = $1, region = $2, ville = $3, code_etablissement = $4, nom_directeur = $5';
    const params = [nom, region, ville, codeEtablissement, nomDirecteur];
    let count = 6;

    if (signature_url !== undefined) {
      query += `, signature_url = $${count}`;
      params.push(signature_url);
      count++;
    }
    if (cachet_url !== undefined) {
      query += `, cachet_url = $${count}`;
      params.push(cachet_url);
      count++;
    }

    query += ` WHERE admin_id = $${count} RETURNING *`;
    params.push(adminId);

    const { rows } = await db.query(query, params);
    return rows[0];
  },

  async searchEtablissements(query) {
    const { rows } = await db.query(
      'SELECT id, nom, ville, region, code_etablissement FROM etablissements WHERE nom ILIKE $1 OR code_etablissement ILIKE $1 LIMIT 10',
      [`%${query}%`]
    );
    return rows;
  }
};

module.exports = EtablissementModel;
