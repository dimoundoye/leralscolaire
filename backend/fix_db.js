const db = require('./db');

async function fixDatabase() {
  try {
    console.log('--- Démarrage de la réparation ---');
    
    // 1. Récupérer le dernier admin créé
    const userRes = await db.query("SELECT id, email FROM users WHERE role = 'ADMIN_ETABLISSEMENT' ORDER BY created_at DESC LIMIT 1");
    
    if (userRes.rows.length === 0) {
      console.log('❌ Aucun compte administrateur trouvé. Veuillez vous inscrire à nouveau.');
      return;
    }
    
    const adminId = userRes.rows[0].id;
    console.log(`👤 Administrateur trouvé : ${userRes.rows[0].email} (${adminId})`);
    
    // 2. Récupérer le dernier établissement créé
    const schoolRes = await db.query("SELECT id, nom FROM etablissements ORDER BY created_at DESC LIMIT 1");
    
    if (schoolRes.rows.length === 0) {
      console.log('❌ Aucun établissement trouvé.');
      return;
    }
    
    const schoolId = schoolRes.rows[0].id;
    console.log(`🏫 Établissement trouvé : ${schoolRes.rows[0].nom} (${schoolId})`);
    
    // 3. Faire la liaison
    await db.query("UPDATE etablissements SET admin_id = $1 WHERE id = $2", [adminId, schoolId]);
    
    console.log('✅ REPARATION REUSSIE : L\'administrateur est maintenant lié à l\'établissement.');
    console.log('Vous pouvez maintenant créer des classes sans erreur.');

  } catch (err) {
    console.error('💥 Erreur lors de la réparation :', err);
  } finally {
    process.exit();
  }
}

fixDatabase();
