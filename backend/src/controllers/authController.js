const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const db = require('../config/db'); // For pool transaction support
const response = require('../utils/response');
const { generateIUP } = require('../utils/iupGenerator');
const emailService = require('../services/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_tres_prive';

const authController = {
  /**
   * Register a new Etablissement
   */
  async registerEtablissement(req, res, next) {
    const { nom, code_etablissement, email, password, region, ville, email_professionnel } = req.body;

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

        const finalCode = code_etablissement || await generateIUP('ETAB', region || 'Dakar', null, client);

        // Create User (Role: ADMIN_ETABLISSEMENT) avec son IUP
        const user = await User.create(email, passwordHash, 'ADMIN_ETABLISSEMENT', finalCode, client);
        const userId = user.id;

        // Create Etablissement linked to this admin with email_professionnel
        await User.createEtablissement(finalCode, nom, region, ville, userId, email_professionnel || email, client);

        await client.query('COMMIT');

        // Envoi automatique de l'email de bienvenue à l'établissement (non-bloquant)
        const targetEmail = email_professionnel || email;
        emailService.sendEtablissementWelcome({
          to: targetEmail,
          nomEtablissement: nom,
          codeEtablissement: finalCode,
          emailAdmin: email
        }).catch(e => console.error('Erreur email établissement:', e.message));

        return response.success(res, { code_etablissement: finalCode }, 'Établissement créé avec succès !', 201);
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
   * Login (Connexion exclusivement par IUP pour les Établissements, Professeurs et Élèves)
   */
  async login(req, res, next) {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return response.error(res, 'Identifiant et mot de passe requis.', 400);
    }

    const cleanId = String(identifier).trim();

    try {
      // 0. Vérifier si l'utilisateur tente de se connecter avec une adresse email
      if (cleanId.includes('@')) {
        // Seul le compte OFFICE_BAC ou les comptes institutionnels spécifiques peuvent tenter une connexion email
        const checkOffice = await db.query(
          "SELECT * FROM users WHERE LOWER(email) = LOWER($1) AND role = 'OFFICE_BAC'",
          [cleanId]
        );
        if (checkOffice.rows.length === 0) {
          return response.error(
            res, 
            "La connexion par adresse email est désactivée. Veuillez utiliser votre Identifiant Unique (IUP) : Code Établissement (ETAB-...), IUP Enseignant (ENS-...) ou IUP Élève (SN-...)", 
            400
          );
        }
      }

      let user;

      // 1. Vérifier si l'identifiant est un compte temporaire de Président de Jury (PRESIDENT.JURY...)
      const juryTempRes = await db.query(
        "SELECT * FROM jurys_bac WHERE LOWER(identifiant_temporaire) = LOWER($1) AND statut = 'ACTIF'",
        [cleanId]
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

      // 2. Recherche utilisateur par IUP (identifiant_national / code_etablissement)
      // a. Recherche directe dans la table users par identifiant_national
      const userRes = await db.query(
        'SELECT * FROM users WHERE LOWER(identifiant_national) = LOWER($1)',
        [cleanId]
      );

      if (userRes.rows.length > 0) {
        user = userRes.rows[0];
      } else {
        // b. Recherche par code_etablissement (IUP établissement ETAB-...)
        const etabRes = await db.query(
          'SELECT admin_id FROM etablissements WHERE LOWER(code_etablissement) = LOWER($1)',
          [cleanId]
        );

        if (etabRes.rows.length > 0) {
          user = await User.findById(etabRes.rows[0].admin_id);
        } else {
          // c. Recherche par identifiant national élève (SN-...)
          const eleveRes = await User.findEleveUserIdByIdentifiant(cleanId);
          if (eleveRes) {
            user = await User.findById(eleveRes.user_id);
          } else {
            // d. Recherche spécifique compte Office du Bac (OFFICE-BAC-SN)
            const officeRes = await db.query(
              "SELECT * FROM users WHERE role = 'OFFICE_BAC' AND (LOWER(email) = LOWER($1) OR LOWER(identifiant_national) = LOWER($1))",
              [cleanId]
            );
            if (officeRes.rows.length > 0) {
              user = officeRes.rows[0];
            }
          }
        }
      }

      if (!user) {
        return response.error(res, 'Identifiant Unique (IUP) incorrect.', 400);
      }

      // 3. Vérification du mot de passe
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return response.error(res, 'Identifiant ou mot de passe incorrect.', 400);
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
  },

  /**
   * Demande de réinitialisation de mot de passe (Vérification IUP + Email)
   */
  async forgotPassword(req, res, next) {
    const { iup, email } = req.body;

    if (!iup || !email) {
      return response.error(res, "Veuillez renseigner à la fois votre IUP et votre adresse email.", 400);
    }

    const cleanIup = String(iup).trim();
    const cleanEmail = String(email).trim().toLowerCase();

    try {
      let matchedUserId = null;

      // 1. Recherche dans users (IUP + Email)
      const userRes = await db.query(
        'SELECT id FROM users WHERE LOWER(identifiant_national) = LOWER($1) AND LOWER(email) = LOWER($2)',
        [cleanIup, cleanEmail]
      );

      if (userRes.rows.length > 0) {
        matchedUserId = userRes.rows[0].id;
      } else {
        // 2. Recherche dans etablissements (code_etablissement + email admin ou email_professionnel)
        const etabRes = await db.query(
          `SELECT e.admin_id FROM etablissements e
           JOIN users u ON e.admin_id = u.id
           WHERE LOWER(e.code_etablissement) = LOWER($1) 
             AND (LOWER(u.email) = LOWER($2) OR LOWER(e.email_professionnel) = LOWER($2))`,
          [cleanIup, cleanEmail]
        );
        if (etabRes.rows.length > 0) {
          matchedUserId = etabRes.rows[0].admin_id;
        } else {
          // 3. Recherche dans eleves (identifiant_national + email eleve ou email user)
          const eleveRes = await db.query(
            `SELECT e.user_id FROM eleves e
             LEFT JOIN users u ON e.user_id = u.id
             WHERE LOWER(e.identifiant_national) = LOWER($1) 
               AND (LOWER(e.email) = LOWER($2) OR LOWER(u.email) = LOWER($2))`,
            [cleanIup, cleanEmail]
          );
          if (eleveRes.rows.length > 0) {
            matchedUserId = eleveRes.rows[0].user_id;
          }
        }
      }

      if (!matchedUserId) {
        return response.error(res, "Aucun compte ne correspond à cette combinaison d'Identifiant Unique (IUP) et d'adresse email.", 404);
      }

      // 4. Générer un code à 6 chiffres
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // 5. Enregistrer le code dans password_resets (valable 15 minutes)
      await db.query('DELETE FROM password_resets WHERE user_id = $1', [matchedUserId]);
      await db.query(
        `INSERT INTO password_resets (user_id, code, expires_at)
         VALUES ($1, $2, NOW() + INTERVAL '15 minutes')`,
        [matchedUserId, code]
      );

      // 6. Envoyer le code par email via emailService
      await emailService.sendPasswordResetCode({
        to: cleanEmail,
        iup: cleanIup,
        code
      });

      return response.success(res, null, "Un code de vérification à 6 chiffres a été envoyé sur votre adresse email.");
    } catch (err) {
      console.error(err);
      return response.error(res, "Erreur lors de l'envoi du code de réinitialisation.", 500);
    }
  },

  /**
   * Validation du code et définition du nouveau mot de passe
   */
  async resetPassword(req, res, next) {
    const { iup, email, code, newPassword } = req.body;

    if (!iup || !email || !code || !newPassword) {
      return response.error(res, "Tous les champs sont obligatoires (IUP, email, code et nouveau mot de passe).", 400);
    }

    if (String(newPassword).length < 6) {
      return response.error(res, "Le mot de passe doit contenir au moins 6 caractères.", 400);
    }

    const cleanIup = String(iup).trim();
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanCode = String(code).trim();

    try {
      let matchedUserId = null;

      // Retrouver l'utilisateur
      const userRes = await db.query(
        'SELECT id FROM users WHERE LOWER(identifiant_national) = LOWER($1) AND LOWER(email) = LOWER($2)',
        [cleanIup, cleanEmail]
      );

      if (userRes.rows.length > 0) {
        matchedUserId = userRes.rows[0].id;
      } else {
        const etabRes = await db.query(
          `SELECT e.admin_id FROM etablissements e
           JOIN users u ON e.admin_id = u.id
           WHERE LOWER(e.code_etablissement) = LOWER($1) 
             AND (LOWER(u.email) = LOWER($2) OR LOWER(e.email_professionnel) = LOWER($2))`,
          [cleanIup, cleanEmail]
        );
        if (etabRes.rows.length > 0) {
          matchedUserId = etabRes.rows[0].admin_id;
        } else {
          const eleveRes = await db.query(
            `SELECT e.user_id FROM eleves e
             LEFT JOIN users u ON e.user_id = u.id
             WHERE LOWER(e.identifiant_national) = LOWER($1) 
               AND (LOWER(e.email) = LOWER($2) OR LOWER(u.email) = LOWER($2))`,
            [cleanIup, cleanEmail]
          );
          if (eleveRes.rows.length > 0) {
            matchedUserId = eleveRes.rows[0].user_id;
          }
        }
      }

      if (!matchedUserId) {
        return response.error(res, "Informations de compte introuvables.", 404);
      }

      // Vérifier le code dans password_resets
      const resetRes = await db.query(
        'SELECT * FROM password_resets WHERE user_id = $1 AND code = $2 AND expires_at > NOW()',
        [matchedUserId, cleanCode]
      );

      if (resetRes.rows.length === 0) {
        return response.error(res, "Code de vérification incorrect ou expiré.", 400);
      }

      // Hacher le nouveau mot de passe
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(newPassword, salt);

      // Mettre à jour le mot de passe utilisateur
      await db.query(
        'UPDATE users SET password_hash = $1, password_provisoire = NULL WHERE id = $2',
        [passwordHash, matchedUserId]
      );

      // Supprimer le code utilisé
      await db.query('DELETE FROM password_resets WHERE user_id = $1', [matchedUserId]);

      return response.success(res, null, "Mot de passe réinitialisé avec succès ! Vous pouvez maintenant vous connecter.");
    } catch (err) {
      console.error(err);
      return response.error(res, "Erreur lors de la réinitialisation du mot de passe.", 500);
    }
  }
};

module.exports = authController;

