/**
 * Service de Notification pour la Vie Scolaire (Email & SMS)
 */

async function sendParentNotification({ type_action, eleve_nom, eleve_prenom, parent_email, parent_telephone, motif, description, date_rendez_vous, lieu_rendez_vous, etablissement_nom }) {
  const result = {
    emailSent: false,
    smsSent: false
  };

  const formattedDate = date_rendez_vous ? new Date(date_rendez_vous).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' }) : null;

  // 1. Simulation / Envoi Email Parent
  if (parent_email || true) {
    console.log(`\n📧 [NOTIFICATION EMAIL PARENT]`);
    console.log(`   À : ${parent_email || 'parent.famille@gmail.com'}`);
    console.log(`   Établissement : ${etablissement_nom || 'LeralScolaire'}`);
    console.log(`   Objet : [${type_action}] Concernant l'élève ${eleve_prenom} ${eleve_nom}`);
    if (type_action === 'CONVOCATION') {
      console.log(`   Message : Vous êtes convoqué(e) à l'établissement le ${formattedDate} à ${lieu_rendez_vous || 'Administration'}.`);
    }
    console.log(`   Motif : ${motif}`);
    if (description) console.log(`   Détails : ${description}`);
    result.emailSent = true;
  }

  // 2. Simulation / Envoi SMS Parent
  if (parent_telephone || true) {
    let smsContent = `[${etablissement_nom || 'LeralScolaire'}] `;
    if (type_action === 'CONVOCATION') {
      smsContent += `Convocation pour l'élève ${eleve_prenom} ${eleve_nom} le ${formattedDate} (${lieu_rendez_vous || 'Administration'}). Motif: ${motif}.`;
    } else if (type_action === 'SIGNALEMENT') {
      smsContent += `Signalement concernant ${eleve_prenom} ${eleve_nom}. Motif: ${motif}. Merci de consulter vos emails.`;
    } else {
      smsContent += `Remarque concernant ${eleve_prenom} ${eleve_nom}. Motif: ${motif}.`;
    }

    console.log(`\n📱 [NOTIFICATION SMS PARENT]`);
    console.log(`   À : ${parent_telephone || '+221 77 000 00 00'}`);
    console.log(`   SMS : ${smsContent}`);
    result.smsSent = true;
  }

  return result;
}

module.exports = {
  sendParentNotification
};
