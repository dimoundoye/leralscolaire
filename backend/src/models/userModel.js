const db = require('../config/db');

const User = {
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
  }
};

module.exports = User;
