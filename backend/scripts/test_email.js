require('dotenv').config({ path: __dirname + '/../.env' });
const emailService = require('../src/services/emailService');

async function main() {
  console.log('--- Test de connexion SMTP LWS ---');
  console.log('Hôte :', process.env.SMTP_HOST);
  console.log('Port :', process.env.SMTP_PORT);
  console.log('Utilisateur :', process.env.SMTP_USER);

  const res = await emailService.verifyConnection();
  if (!res.success) {
    console.error('❌ Échec du test :', res.error);
    process.exit(1);
  }

  const testRecipient = process.argv[2];
  if (testRecipient) {
    console.log(`\nEnvoi d'un email de test à ${testRecipient}...`);
    await emailService.sendEleveWelcome({
      to: testRecipient,
      nom: 'Diallo',
      prenom: 'Mamadou',
      iupEleve: 'SN-2026-DKR-0001',
      tempPassword: 'pass' + Math.floor(1000 + Math.random() * 9000),
      nomEtablissement: 'Lycée d\'Excellence LéralScolaire',
      classeNom: 'Terminale S1',
      isParent: false
    });
    console.log('🎉 Test d\'envoi terminé ! Vérifiez la boîte de réception.');
  } else {
    console.log('💡 Astuce : Passez une adresse email en argument pour tester un envoi réel :');
    console.log('   node -r dotenv/config backend/scripts/test_email.js votre_email@gmail.com');
  }

  process.exit(0);
}

main();
