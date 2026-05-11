const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_tres_prive';

// --- INSCRIPTION ETABLISSEMENT ---
router.post('/register-etablissement', async (req, res) => {
  const { nom, code_etablissement, email, password, region, ville } = req.body;

  try {
    // 1. Vérifier si l'utilisateur existe déjà
    const userExists = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }

    // 2. Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Transaction pour créer l'utilisateur et l'établissement
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      
      // Créer l'utilisateur (Rôle: ADMIN_ETABLISSEMENT)
      const userRes = await client.query(
        'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id',
        [email, passwordHash, 'ADMIN_ETABLISSEMENT']
      );
      const userId = userRes.rows[0].id;

      // Créer l'établissement lié à cet admin
      await client.query(
        'INSERT INTO etablissements (code_etablissement, nom, region, ville, admin_id) VALUES ($1, $2, $3, $4, $5)',
        [code_etablissement, nom, region || 'Sénégal', ville || 'Non précisée', userId]
      );

      await client.query('COMMIT');
      res.status(201).json({ message: 'Établissement créé avec succès !' });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de l\'inscription.' });
  }
});

// --- CONNEXION (Tous rôles) ---
router.post('/login', async (req, res) => {
  const { identifier, password } = req.body; // identifier peut être email ou ID élève

  try {
    // 1. Chercher l'utilisateur par email OU par identifiant national d'élève
    let user;
    
    // Test si c'est un email
    const userRes = await db.query(
      'SELECT * FROM users WHERE email = $1 OR identifiant_national = $1',
      [identifier]
    );
    
    if (userRes.rows.length > 0) {
      user = userRes.rows[0];
    } else {
      // Test si c'est un identifiant élève (SN-...)
      const eleveRes = await db.query('SELECT user_id FROM eleves WHERE identifiant_national = $1', [identifier]);
      if (eleveRes.rows.length > 0) {
        const uRes = await db.query('SELECT * FROM users WHERE id = $1', [eleveRes.rows[0].user_id]);
        user = uRes.rows[0];
      }
    }

    if (!user) {
      return res.status(400).json({ message: 'Identifiants incorrects.' });
    }

    // 2. Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Identifiants incorrects.' });
    }

    // 3. Générer le JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la connexion.' });
  }
});

module.exports = router;
