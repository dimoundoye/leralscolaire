require('dotenv').config();
const db = require('../src/config/db');
const { generateIUP } = require('../src/utils/iupGenerator');
const emailService = require('../src/services/emailService');

// Migration v40 : correction des comptes enseignants ayant reçu une matière ou un mauvais
// identifiant au lieu d'un IUP officiel (ENS-...). Auparavant exécutée à chaque démarrage
// du serveur. Idempotente : seuls les comptes encore invalides sont traités.
async function migrate() {
  try {
    console.log('🚀 Migration v40 : correction des IUP enseignants invalides...');

    const { rows: badIupProfs } = await db.query(`
      SELECT u.id, u.email, u.identifiant_national, p.region, p.nom, p.prenom, u.password_provisoire
      FROM users u
      LEFT JOIN professeurs p ON u.id = p.id
      WHERE u.role = 'PROFESSEUR' AND (u.identifiant_national NOT LIKE 'ENS-%' OR u.identifiant_national IS NULL)
    `);

    for (const prof of badIupProfs) {
      const fixedIup = await generateIUP('ENS', prof.region || 'Dakar');
      await db.query('UPDATE users SET identifiant_national = $1 WHERE id = $2', [fixedIup, prof.id]);
      console.log(`  ✓ IUP corrigé pour l'enseignant ${prof.email} (${prof.identifiant_national} -> ${fixedIup})`);

      if (prof.email) {
        try {
          await emailService.sendDemandeValidee({
            to: prof.email,
            nom: [prof.prenom, prof.nom].filter(Boolean).join(' ') || 'Enseignant',
            typeDemande: 'PROFESSEUR',
            iup: fixedIup,
            // Absent si l'enseignant a déjà défini son propre mot de passe : l'email n'en affiche alors aucun.
            tempPassword: prof.password_provisoire,
          });
          console.log(`  📧 Nouvel IUP (${fixedIup}) envoyé à ${prof.email}`);
        } catch (e) {
          console.error('  Erreur envoi email avec IUP corrigé:', e.message);
        }
      }
    }

    console.log(`✅ Migration v40 exécutée avec succès (${badIupProfs.length} compte(s) corrigé(s)) !`);
  } catch (err) {
    console.error('❌ Erreur migration v40:', err);
  } finally {
    process.exit();
  }
}

migrate();
