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

    // 2. Vérifier si le compte existe déjà
    const existing = await db.query(
      "SELECT id FROM users WHERE email = 'OFFICE-BAC-SN'",
    );

    if (existing.rows.length > 0) {
      console.log('  ℹ️  Compte OFFICE-BAC-SN existe déjà, mise à jour du mot de passe...');
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('OfficeBAC@2026', salt);
      await db.query(
        "UPDATE users SET password_hash = $1, role = 'OFFICE_BAC' WHERE email = 'OFFICE-BAC-SN'",
        [hash]
      );
      console.log('  ✓ Mot de passe mis à jour');
    } else {
      // 3. Créer le compte Office du BAC
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('OfficeBAC@2026', salt);

      await db.query(
        "INSERT INTO users (email, password_hash, role) VALUES ('OFFICE-BAC-SN', $1, 'OFFICE_BAC')",
        [hash]
      );
      console.log('  ✓ Compte OFFICE-BAC-SN créé avec succès');
    }

    console.log('\n✅ Migration v23 terminée !');
    console.log('   ┌─────────────────────────────────────┐');
    console.log('   │  IDENTIFIANTS OFFICE DU BAC         │');
    console.log('   │  Login    : OFFICE-BAC-SN            │');
    console.log('   │  Password : OfficeBAC@2026           │');
    console.log('   │  Rôle     : OFFICE_BAC               │');
    console.log('   │  URL      : /office/dashboard        │');
    console.log('   └─────────────────────────────────────┘');
  } catch (err) {
    console.error('❌ Erreur migration v23:', err);
  } finally {
    process.exit();
  }
}

migrate();
