const db = require('../config/db');

const User = {
  async findByEmail(email) {
    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0];
  },

  async findByEmailOrIdentifiant(identifier) {
    const { rows } = await db.query(
      'SELECT * FROM users WHERE email = $1 OR identifiant_national = $1',
      [identifier]
    );
    return rows[0];
  },

  async findById(id) {
    const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    return rows[0];
  },

  async findEleveUserIdByIdentifiant(identifiant) {
    const { rows } = await db.query('SELECT user_id FROM eleves WHERE identifiant_national = $1', [identifiant]);
    return rows[0];
  },

  async create(email, passwordHash, role, identifiantNational = null, client = db) {
    const { rows } = await client.query(
      'INSERT INTO users (email, password_hash, role, identifiant_national) VALUES ($1, $2, $3, $4) RETURNING id, email, role, identifiant_national',
      [email, passwordHash, role, identifiantNational]
    );
    return rows[0];
  },

  async createEtablissement(codeEtablissement, nom, region, ville, adminId, emailProfessionnel = null, client = db) {
    const { rows } = await client.query(
      'INSERT INTO etablissements (code_etablissement, nom, region, ville, admin_id, email_professionnel) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [codeEtablissement, nom, region || 'Sénégal', ville || 'Non précisée', adminId, emailProfessionnel || null]
    );
    return rows[0];
  }
};

module.exports = User;
