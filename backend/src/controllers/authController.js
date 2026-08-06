const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const db = require('../config/db'); // For pool transaction support
const response = require('../utils/response');

const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_tres_prive';

const authController = {
  /**
   * Register a new Etablissement
   */
  async registerEtablissement(req, res, next) {
    const { nom, code_etablissement, email, password, region, ville } = req.body;

    try {
      // 1. Check if user already exists
      const userExists = await User.findByEmail(email);
      if (userExists) {
        return response.error(res, 'Cet email est déjà utilisé.', 400);
      }

      // 2. Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // 3. Connect client from pool for transaction
      const client = await db.pool.connect();
      try {
        await client.query('BEGIN');

        // Create User (Role: ADMIN_ETABLISSEMENT)
        const user = await User.create(email, passwordHash, 'ADMIN_ETABLISSEMENT', client);
        const userId = user.id;

        // Create Etablissement linked to this admin
        await User.createEtablissement(code_etablissement, nom, region, ville, userId, client);

        await client.query('COMMIT');
        return response.success(res, null, 'Établissement créé avec succès !', 201);
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      console.error(err);
      return response.error(res, "Erreur lors de l'inscription.", 500);
    }
  },

  /**
   * Login (for all roles: admin, student, teacher)
   */
  async login(req, res, next) {
    const { identifier, password } = req.body;

    try {
      let user;

      // 0. Vérifier si l'identifiant est un compte temporaire de Président de Jury (PRESIDENT.JURY...)
      const juryTempRes = await db.query(
        "SELECT * FROM jurys_bac WHERE LOWER(identifiant_temporaire) = LOWER($1) AND statut = 'ACTIF'",
        [identifier]
      );

      if (juryTempRes.rows.length > 0) {
        const juryRow = juryTempRes.rows[0];

        // Contrôle strict de la date d'expiration
        if (juryRow.date_expiration_acces && new Date() > new Date(juryRow.date_expiration_acces)) {
          const dateExpFormatted = new Date(juryRow.date_expiration_acces).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
          return response.error(res, `Vos accès temporaires de Président du ${juryRow.numero_jury} ont expiré le ${dateExpFormatted}. Votre mission pour ce jury est clôturée.`, 403);
        }

        // Vérification du mot de passe temporaire
        const matchTempPass = juryRow.password_hash 
          ? await bcrypt.compare(password, juryRow.password_hash)
          : password === juryRow.mot_de_passe_temporaire;

        if (!matchTempPass) {
          return response.error(res, 'Mot de passe temporaire de président de jury incorrect.', 400);
        }

        let profUserId = juryRow.president_prof_id;
        if (!profUserId) {
          const adminUser = await db.query("SELECT id FROM users WHERE role = 'OFFICE_BAC' LIMIT 1");
          profUserId = adminUser.rows.length > 0 ? adminUser.rows[0].id : 1;
        }

        const token = jwt.sign(
          { id: profUserId, role: 'PRESIDENT_JURY', numero_jury: juryRow.numero_jury, jury_id: juryRow.id },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        return res.json({
          token,
          user: {
            id: profUserId,
            email: juryRow.identifiant_temporaire,
            role: 'PRESIDENT_JURY',
            is_president_jury: true,
            numero_jury: juryRow.numero_jury,
            centre_examen: juryRow.centre_examen,
            date_expiration_acces: juryRow.date_expiration_acces
          }
        });
      }

      // 1. Search for user by email or identifiant_national
      const userRes = await User.findByEmailOrIdentifiant(identifier);
      if (userRes) {
        user = userRes;
      } else {
        // Test if identifier is student national ID (SN-...)
        const eleveRes = await User.findEleveUserIdByIdentifiant(identifier);
        if (eleveRes) {
          user = await User.findById(eleveRes.user_id);
        }
      }

      if (!user) {
        return response.error(res, 'Identifiants incorrects.', 400);
      }

      // 2. Verify password
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return response.error(res, 'Identifiants incorrects.', 400);
      }

      // 3. Generate JWT
      const token = jwt.sign(
        { id: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // 4. Détecter si le professeur est actuellement Président de Jury BAC actif et NON EXPIRÉ
      const checkJury = await db.query(
        "SELECT numero_jury FROM jurys_bac WHERE president_prof_id = $1 AND statut = 'ACTIF' AND (date_expiration_acces IS NULL OR date_expiration_acces >= NOW()) LIMIT 1",
        [user.id]
      );
      const isPresidentJury = checkJury.rows.length > 0;

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          is_president_jury: isPresidentJury,
          numero_jury: isPresidentJury ? checkJury.rows[0].numero_jury : null
        }
      });
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la connexion.', 500);
    }
  }
};

module.exports = authController;
