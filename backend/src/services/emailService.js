const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const SMTP_HOST = process.env.SMTP_HOST || 'mail.leralscolaire.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465', 10);
const SMTP_SECURE = process.env.SMTP_SECURE === 'true' || SMTP_PORT === 465;
const SMTP_USER = process.env.SMTP_USER || 'noreply@leralscolaire.com';
const SMTP_PASS = process.env.SMTP_PASS || '';
const RAW_EMAIL_FROM = process.env.EMAIL_FROM || '"LéralScolaire" <noreply@leralscolaire.com>';
const EMAIL_FROM = RAW_EMAIL_FROM.replace(/^"|"$/g, '');
const FRONTEND_URL = (process.env.FRONTEND_URL || 'https://leralscolaire.com').replace(/\/$/, '');

// Chemins possibles pour localiser le logo (dans backend/src/assets, cwd, ou frontend)
const POSSIBLE_LOGO_PATHS = [
  path.join(__dirname, '../assets/logo_leralscolaire.png'),
  path.join(__dirname, '../../uploads/logo_leralscolaire.png'),
  path.join(__dirname, '../../../frontend/public/logo_leralscolaire.png'),
  path.join(process.cwd(), 'src/assets/logo_leralscolaire.png'),
  path.join(process.cwd(), 'assets/logo_leralscolaire.png')
];

function getExistingLogoPath() {
  for (const p of POSSIBLE_LOGO_PATHS) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

// Création du transporteur Nodemailer
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE, // true pour le port 465, false pour 587
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  },
  tls: {
    // Évite les rejets de certificats auto-signés éventuels sur certains serveurs SMTP
    rejectUnauthorized: false
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100
});

// Envoi d'email avec logo CID embarqué garanti (ou fallback URL publique si absent)
async function sendMailWithLogo(mailOptions) {
  const attachments = [...(mailOptions.attachments || [])];
  const logoPath = getExistingLogoPath();
  let html = mailOptions.html || '';

  if (logoPath) {
    attachments.push({
      filename: 'logo_leralscolaire.png',
      path: logoPath,
      cid: 'logo_leralscolaire'
    });
  } else {
    // Si le logo local n'est pas trouvé, utiliser l'URL web absolue
    const publicLogoUrl = `${FRONTEND_URL}/logo_leralscolaire.png`;
    html = html.replace(/cid:logo_leralscolaire/g, publicLogoUrl);
  }

  const fromClean = (mailOptions.from || EMAIL_FROM).replace(/^"|"$/g, '');

  return transporter.sendMail({
    ...mailOptions,
    from: fromClean,
    html,
    attachments
  });
}

/**
 * Gabarit de base HTML responsive pour les emails LeralScolaire
 */
function getEmailLayout({ title, subtitle, contentHtml, ctaText = 'Accéder à LeralScolaire', ctaLink = `${FRONTEND_URL}/auth` }) {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      line-height: 1.6;
    }
    .wrapper {
      width: 100%;
      background-color: #f1f5f9;
      padding: 30px 15px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: #ffffff;
      padding: 32px 24px 22px 24px;
      text-align: center;
      border-bottom: 2px solid #e2e8f0;
    }
    .header-logo {
      margin-bottom: 12px;
      text-align: center;
    }
    .header-logo img {
      height: 56px;
      width: auto;
      display: inline-block;
      object-fit: contain;
    }
    .header-tag {
      display: inline-block;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #64748b;
      margin-bottom: 4px;
    }
    .header h1 {
      margin: 0;
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #1e3a8a !important; /* Bleu officiel de la plateforme, PAS de deux tons ! */
    }
    .header p {
      margin: 4px 0 0 0;
      font-size: 13px;
      color: #64748b;
      font-weight: 500;
    }
    .body-content {
      padding: 32px 28px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 16px;
    }
    .credentials-box {
      background: #f8fafc;
      border: 1.5px solid #e2e8f0;
      border-radius: 10px;
      padding: 18px 20px;
      margin: 22px 0;
    }
    .credential-item {
      margin-bottom: 12px;
    }
    .credential-item:last-child {
      margin-bottom: 0;
    }
    .credential-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #64748b;
      margin-bottom: 4px;
    }
    .credential-value {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      background: #ffffff;
      padding: 8px 12px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
      display: inline-block;
      letter-spacing: 0.5px;
    }
    .btn-container {
      text-align: center;
      margin: 28px 0 16px 0;
    }
    .btn-cta {
      display: inline-block;
      background-color: #1e3a8a;
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 700;
      font-size: 15px;
      padding: 12px 28px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(30, 58, 138, 0.3);
    }
    .security-notice {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 6px;
      padding: 12px 16px;
      font-size: 13px;
      color: #92400e;
      margin-top: 20px;
    }
    .footer {
      background: #f8fafc;
      padding: 20px 24px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
    }
    .footer p {
      margin: 4px 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="header-logo">
          <img src="cid:logo_leralscolaire" alt="Logo LéralScolaire" />
        </div>
        <div class="header-tag">RÉPUBLIQUE DU SÉNÉGAL</div>
        <h1>LéralScolaire</h1>
        <p>${subtitle || 'Plateforme Nationale du Livret Scolaire'}</p>
      </div>
      <div class="body-content">
        ${contentHtml}
        ${ctaText ? `
        <div class="btn-container">
          <a href="${ctaLink}" class="btn-cta" target="_blank">${ctaText}</a>
        </div>` : ''}
        <div class="security-notice">
          <strong>Sécurité :</strong> Ce mot de passe est provisoire. Vous pouvez et devez le modifier dès votre première connexion dans les paramètres de votre compte. Ne partagez jamais vos identifiants.
        </div>
      </div>
      <div class="footer">
        <p><strong>LéralScolaire</strong> — Système National Informatisé du Livret Scolaire</p>
        <p>Ceci est un message automatique, merci de ne pas y répondre directement.</p>
        <p>© ${new Date().getFullYear()} Tous droits réservés.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

const emailService = {
  /**
   * Vérifie la connexion au serveur SMTP
   */
  async verifyConnection() {
    try {
      await transporter.verify();
      console.log('✅ Connexion SMTP LWS établie avec succès !');
      return { success: true };
    } catch (error) {
      console.error('❌ Échec de connexion SMTP LWS :', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Envoi de l'email de bienvenue à un Établissement
   */
  async sendEtablissementWelcome({ to, nomEtablissement, codeEtablissement, emailAdmin }) {
    if (!to) return;
    try {
      const contentHtml = `
        <div class="greeting">Félicitations pour l'enregistrement de votre établissement !</div>
        <p>L'établissement <strong>${nomEtablissement}</strong> a été enregistré avec succès sur la plateforme nationale <strong>LéralScolaire</strong>.</p>
        <p>Voici vos identifiants officiels d'administration :</p>
        
        <div class="credentials-box">
          <div class="credential-item">
            <div class="credential-label">Code IUP Établissement</div>
            <div class="credential-value">${codeEtablissement}</div>
          </div>
          <div class="credential-item">
            <div class="credential-label">Email de connexion Administrateur</div>
            <div class="credential-value">${emailAdmin || to}</div>
          </div>
        </div>

        <p>Grâce à cet espace, vous pouvez gérer vos classes, vos enseignants, vos élèves et dématérialiser les livrets et relevés scolaires de votre établissement.</p>
      `;

      const html = getEmailLayout({
        title: 'Bienvenue sur LéralScolaire - Établissement',
        subtitle: 'Confirmation d\'enregistrement d\'établissement',
        contentHtml,
        ctaText: 'Accéder à l\'espace Établissement',
        ctaLink: `${FRONTEND_URL}/auth`
      });

      const info = await sendMailWithLogo({
        from: EMAIL_FROM,
        to,
        subject: `[LéralScolaire] Création de votre compte Établissement : ${nomEtablissement} (${codeEtablissement})`,
        html
      });

      console.log(`✉️ Email établissement envoyé à ${to} (MessageId: ${info.messageId})`);
      return info;
    } catch (err) {
      console.error(`⚠️ Erreur envoi email établissement à ${to}:`, err.message);
    }
  },

  /**
   * Envoi de l'email de bienvenue à un Enseignant (Professeur)
   */
  async sendProfesseurWelcome({ to, nom, prenom, iupProf, tempPassword, nomEtablissement }) {
    if (!to) return;
    try {
      const displayName = [prenom, nom].filter(Boolean).join(' ') || 'Professeur';
      const contentHtml = `
        <div class="greeting">Bonjour ${displayName},</div>
        <p>Un compte enseignant a été créé pour vous sur la plateforme nationale <strong>LéralScolaire</strong>${nomEtablissement ? ` pour l'établissement <strong>${nomEtablissement}</strong>` : ''}.</p>
        <p>Voici vos identifiants d'accès personnels :</p>
        
        <div class="credentials-box">
          <div class="credential-item">
            <div class="credential-label">Identifiant National Unique (IUP Enseignant)</div>
            <div class="credential-value">${iupProf || to}</div>
          </div>
          <div class="credential-item">
            <div class="credential-label">Email</div>
            <div class="credential-value">${to}</div>
          </div>
          <div class="credential-item">
            <div class="credential-label">Mot de passe temporaire</div>
            <div class="credential-value">${tempPassword}</div>
          </div>
        </div>

        <p>Vous pouvez vous connecter à votre espace en utilisant votre <strong>IUP</strong> ou votre <strong>adresse email</strong> ainsi que le mot de passe temporaire ci-dessus.</p>
      `;

      const html = getEmailLayout({
        title: 'Vos accès Enseignant LéralScolaire',
        subtitle: 'Espace Corps Enseignant',
        contentHtml,
        ctaText: 'Accéder au Portail Enseignant',
        ctaLink: `${FRONTEND_URL}/auth`
      });

      const info = await sendMailWithLogo({
        from: EMAIL_FROM,
        to,
        subject: `[LéralScolaire] Vos accès Enseignant - IUP : ${iupProf}`,
        html
      });

      console.log(`✉️ Email professeur envoyé à ${to} (MessageId: ${info.messageId})`);
      return info;
    } catch (err) {
      console.error(`⚠️ Erreur envoi email professeur à ${to}:`, err.message);
    }
  },

  /**
   * Envoi de l'email de bienvenue à un Élève ou à son Tuteur/Parent
   */
  async sendEleveWelcome({ to, nom, prenom, iupEleve, tempPassword, nomEtablissement, classeNom, isParent = false }) {
    if (!to) return;
    try {
      const displayEleve = [prenom, nom].filter(Boolean).join(' ') || "l'élève";
      const contentHtml = `
        <div class="greeting">${isParent ? 'Bonjour cher Parent / Tuteur,' : `Bonjour ${displayEleve},`}</div>
        <p>${isParent 
          ? `L'inscription scolaire de votre enfant <strong>${displayEleve}</strong> a été enregistrée avec succès` 
          : `Votre inscription scolaire a été enregistrée avec succès`}
          ${nomEtablissement ? ` à l'établissement <strong>${nomEtablissement}</strong>` : ''}
          ${classeNom ? ` (Classe : <strong>${classeNom}</strong>)` : ''}.
        </p>

        <p>Voici les identifiants officiels d'accès au portail numérique pour suivre les notes, devoirs, absences et bulletins :</p>
        
        <div class="credentials-box">
          <div class="credential-item">
            <div class="credential-label">Identifiant National Unique de l'élève (IUP)</div>
            <div class="credential-value">${iupEleve}</div>
          </div>
          <div class="credential-item">
            <div class="credential-label">Mot de passe temporaire</div>
            <div class="credential-value">${tempPassword}</div>
          </div>
        </div>

        <p>L'élève (ou son responsable) peut se connecter sur <strong>LéralScolaire</strong> avec son <strong>IUP</strong> et le mot de passe temporaire ci-dessus.</p>
      `;

      const html = getEmailLayout({
        title: 'Vos identifiants LéralScolaire',
        subtitle: 'Livret Numérique de l\'Élève',
        contentHtml,
        ctaText: 'Consulter l\'espace Élève',
        ctaLink: `${FRONTEND_URL}/auth`
      });

      const info = await sendMailWithLogo({
        from: EMAIL_FROM,
        to,
        subject: `[LéralScolaire] Identifiants d'accès scolaire pour ${displayEleve} (IUP : ${iupEleve})`,
        html
      });

      console.log(`✉️ Email élève envoyé à ${to} (MessageId: ${info.messageId})`);
      return info;
    } catch (err) {
      console.error(`⚠️ Erreur envoi email élève à ${to}:`, err.message);
    }
  },

  /**
   * Envoi du code de réinitialisation de mot de passe
   */
  async sendPasswordResetCode({ to, iup, code }) {
    if (!to || !code) return;
    try {
      const contentHtml = `
        <div class="greeting">Réinitialisation de votre mot de passe</div>
        <p>Une demande de réinitialisation a été demandée pour le compte associé à l'Identifiant Unique (IUP) : <strong>${iup}</strong>.</p>
        <p>Voici votre code de vérification temporaire à 6 chiffres :</p>
        
        <div style="text-align: center; margin: 24px 0;">
          <div style="display: inline-block; font-family: monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #1e3a8a; background: #eff6ff; padding: 14px 28px; border-radius: 10px; border: 2px dashed #3b82f6;">
            ${code}
          </div>
          <p style="font-size: 12px; color: #64748b; margin-top: 8px;">Ce code expire dans <strong>15 minutes</strong>.</p>
        </div>

        <p>Saisissez ce code dans le formulaire de l'application pour définir votre nouveau mot de passe.</p>
        <p style="font-size: 13px; color: #64748b;">Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email. Votre mot de passe actuel reste inchangé et sécurisé.</p>
      `;

      const html = getEmailLayout({
        title: 'Réinitialisation de votre mot de passe LéralScolaire',
        subtitle: 'Sécurité et Accès au Compte',
        contentHtml,
        ctaText: 'Retourner sur LéralScolaire',
        ctaLink: `${FRONTEND_URL}/auth`
      });

      const info = await sendMailWithLogo({
        from: EMAIL_FROM,
        to,
        subject: `[LéralScolaire] Code de réinitialisation : ${code}`,
        html
      });

      console.log(`✉️ Code de réinitialisation envoyé à ${to} (MessageId: ${info.messageId})`);
      return info;
    } catch (err) {
      console.error(`⚠️ Erreur envoi code réinitialisation à ${to}:`, err.message);
      throw err;
    }
  },

  /**
   * Envoi de l'accusé de réception pour une demande de pré-inscription (Office du Bac)
   */
  async sendDemandeReception({ to, nom, typeDemande, referenceId }) {
    if (!to) return;
    try {
      const typeLabel = typeDemande === 'ETABLISSEMENT' ? "Établissement Scolaire" : "Enseignant / Professeur";
      const contentHtml = `
        <div class="greeting">Bonjour ${nom || ''},</div>
        <p>Votre demande de <strong>pré-inscription (${typeLabel})</strong> a été reçue avec succès par les services de l'<strong>Office du Baccalauréat du Sénégal</strong>.</p>
        
        <div class="credentials-box" style="background: #f8fafc; border: 1.5px solid #cbd5e1;">
          <div class="credential-item">
            <div class="credential-label">Numéro de Dossier / Référence</div>
            <div class="credential-value" style="font-size: 16px; color: #1e3a8a;">#DEM-${referenceId || 'EN-COURS'}</div>
          </div>
          <div class="credential-item">
            <div class="credential-label">Statut Actuel</div>
            <div class="credential-value" style="font-size: 14px; color: #d97706;">⏳ EN COURS D'INSTRUCTION</div>
          </div>
        </div>

        <p><strong>Que se passe-t-il ensuite ?</strong></p>
        <p>Un agent assermenté de l'Office du Bac procède à l'examen de votre dossier et à la vérification de vos pièces justificatives (arrêté d'ouverture, CNI, diplôme, etc.).</p>
        <p>Dès que la décision sera rendue, vous recevrez une notification officielle par email :</p>
        <ul>
          <li><strong>Si la demande est validée :</strong> Vos identifiants officiels (IUP national et mot de passe temporaire) vous seront transmis.</li>
          <li><strong>Si la demande nécessite une correction :</strong> Le motif précis du rejet vous sera notifié avec les pièces ou champs à compléter.</li>
        </ul>
      `;

      const html = getEmailLayout({
        title: 'Accusé de réception de votre demande',
        subtitle: 'Office du Baccalauréat - Sénégal',
        contentHtml,
        ctaText: 'Suivre l\'actualité LéralScolaire',
        ctaLink: `${FRONTEND_URL}/`
      });

      const info = await sendMailWithLogo({
        from: EMAIL_FROM,
        to,
        subject: `[Office du BAC] Accusé de réception de votre demande de pré-inscription (${typeLabel})`,
        html
      });

      console.log(`✉️ Accusé de réception pré-inscription envoyé à ${to} (MessageId: ${info.messageId})`);
      return info;
    } catch (err) {
      console.error(`⚠️ Erreur envoi accusé réception à ${to}:`, err.message);
    }
  },

  /**
   * Envoi de l'approbation d'une demande de pré-inscription avec identifiants officiels
   */
  async sendDemandeValidee({ to, nom, typeDemande, iup, tempPassword }) {
    if (!to) return;
    try {
      const isEtab = typeDemande === 'ETABLISSEMENT';
      const typeLabel = isEtab ? "Établissement Scolaire" : "Enseignant / Professeur";

      const contentHtml = `
        <div class="greeting">Félicitations ${nom || ''} !</div>
        <p>Nous avons le plaisir de vous informer que votre demande de pré-inscription en tant que <strong>${typeLabel}</strong> a été <span style="color: #15803d; font-weight: 700;">OFFICIELLEMENT VALIDÉE</span> par l'Office du Baccalauréat.</p>
        
        <p>Votre compte est désormais actif. Voici vos identifiants officiels d'accès au portail national :</p>

        <div class="credentials-box">
          <div class="credential-item">
            <div class="credential-label">Identifiant Unique (IUP ${isEtab ? 'Établissement' : 'Enseignant'})</div>
            <div class="credential-value">${iup}</div>
          </div>
          <div class="credential-item">
            <div class="credential-label">Mot de passe temporaire</div>
            <div class="credential-value" style="letter-spacing: 2px;">${tempPassword}</div>
          </div>
        </div>

        <div class="alert-box">
          ⚠️ <strong>Consigne de sécurité :</strong> La connexion à la plateforme s'effectue exclusivement avec votre <strong>IUP (${iup})</strong> et votre mot de passe.
        </div>

        <p>Vous êtes invité à modifier votre mot de passe dès votre première connexion.</p>
      `;

      const html = getEmailLayout({
        title: 'Demande Validée - Vos accès officiels',
        subtitle: 'Office du Baccalauréat - Sénégal',
        contentHtml,
        ctaText: 'Se Connecter à LéralScolaire',
        ctaLink: `${FRONTEND_URL}/auth`
      });

      const info = await sendMailWithLogo({
        from: EMAIL_FROM,
        to,
        subject: `[Office du BAC] Demande approuvée - Vos identifiants officiels (${iup})`,
        html
      });

      console.log(`✉️ Notification validation demande envoyée à ${to} (MessageId: ${info.messageId})`);
      return info;
    } catch (err) {
      console.error(`⚠️ Erreur envoi validation demande à ${to}:`, err.message);
    }
  },

  /**
   * Envoi du refus / demande de correction pour une demande de pré-inscription
   */
  async sendDemandeRejetee({ to, nom, typeDemande, motifRejet }) {
    if (!to) return;
    try {
      const typeLabel = typeDemande === 'ETABLISSEMENT' ? "Établissement Scolaire" : "Enseignant / Professeur";

      const contentHtml = `
        <div class="greeting">Bonjour ${nom || ''},</div>
        <p>Après examen de votre dossier de pré-inscription en tant que <strong>${typeLabel}</strong>, les services de l'Office du Baccalauréat vous informent que votre demande n'a pas pu être validée en l'état.</p>
        
        <div class="credentials-box" style="background: #fff5f5; border: 1.5px solid #feb2b2;">
          <div class="credential-item">
            <div class="credential-label" style="color: #991b1b; font-weight: 700;">MOTIF DU REFUS / OBSERVATIONS DE L'OFFICE DU BAC :</div>
            <div style="font-size: 15px; color: #7f1d1d; margin-top: 6px; white-space: pre-wrap; line-height: 1.5;">
              ${motifRejet || "Pièces justificatives incomplètes ou non conformes aux critères ministériels."}
            </div>
          </div>
        </div>

        <p><strong>Que devez-vous faire ?</strong></p>
        <p>Nous vous invitons à corriger ou compléter les éléments mentionnés ci-dessus en effectuant une nouvelle soumission via le portail d'inscription nationale avec les documents mis à jour.</p>
      `;

      const html = getEmailLayout({
        title: 'Décision relative à votre demande de pré-inscription',
        subtitle: 'Office du Baccalauréat - Sénégal',
        contentHtml,
        ctaText: 'Accéder au Portail de Pré-inscription',
        ctaLink: `${FRONTEND_URL}/inscription-nationale?type=${typeDemande}`
      });

      const info = await sendMailWithLogo({
        from: EMAIL_FROM,
        to,
        subject: `[Office du BAC] Décision relative à votre demande de pré-inscription (${typeLabel})`,
        html
      });

      console.log(`✉️ Notification refus pré-inscription envoyée à ${to} (MessageId: ${info.messageId})`);
      return info;
    } catch (err) {
      console.error(`⚠️ Erreur envoi refus pré-inscription à ${to}:`, err.message);
    }
  }
};

module.exports = emailService;


