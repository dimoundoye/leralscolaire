require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../src/config/db');

async function migrate() {
  try {
    console.log('🚀 Migration v23 : Création du compte Office du BAC...');

    // 1. Ajouter le rôle OFFICE_BAC à la contrainte CHECK si elle existe
    await db.query(`
      DO $$
      BEGIN
        -- Supprimer l'ancienne contrainte si elle existe
        IF EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check'
        ) THEN
          ALTER TABLE users DROP CONSTRAINT users_role_check;
        END IF;
        -- Recréer avec le nouveau rôle
        ALTER TABLE users ADD CONSTRAINT users_role_check
          CHECK (role IN ('ADMIN_ETABLISSEMENT', 'ELEVE', 'PROFESSEUR', 'OFFICE_BAC'));
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Contrainte role non modifiée : %', SQLERRM;
      END
      $$;
    `);
    console.log('  ✓ Rôle OFFICE_BAC ajouté à la contrainte');

    // 2. Créer le compte Office du BAC s'il n'existe pas encore.
    // Un compte existant n'est jamais modifié : son mot de passe appartient à son titulaire.
    const existing = await db.query(
      "SELECT id FROM users WHERE email = 'OFFICE-BAC-SN'",
    );

    if (existing.rows.length > 0) {
      console.log('  ℹ️  Compte OFFICE-BAC-SN déjà présent, aucune modification.');
    } else if (!process.env.OFFICE_BAC_INITIAL_PASSWORD) {
      console.warn('  ⚠️ Compte OFFICE-BAC-SN absent : définissez OFFICE_BAC_INITIAL_PASSWORD puis relancez les migrations.');
    } else {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(process.env.OFFICE_BAC_INITIAL_PASSWORD, salt);

      await db.query(
        "INSERT INTO users (email, password_hash, role) VALUES ('OFFICE-BAC-SN', $1, 'OFFICE_BAC')",
        [hash]
      );
      console.log('  ✓ Compte OFFICE-BAC-SN créé avec le mot de passe défini dans OFFICE_BAC_INITIAL_PASSWORD');
    }

    console.log('✅ Migration v23 terminée !');
  } catch (err) {
    console.error('❌ Erreur migration v23:', err);
  } finally {
    process.exit();
  }
}

migrate();
