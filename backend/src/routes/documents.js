const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/authMiddleware');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const { generateSenegalBulletinPdf } = require('../utils/senegalBulletinPdfService');

// --- GÉNÉRATION BULLETIN PDF (MODELE SÉNÉGALISÉ 1ER & 2ÈME SEMESTRE) ---
router.get('/bulletin/:eleveId', auth, async (req, res) => {
  const { eleveId } = req.params;
  const { semestre } = req.query;

  try {
    if (req.user.role === 'ELEVE') {
      const eleveCheck = await db.query('SELECT user_id FROM eleves WHERE id = $1', [eleveId]);
      if (eleveCheck.rows.length === 0 || eleveCheck.rows[0].user_id !== req.user.id) {
        return res.status(403).json({ message: 'Accès refusé. Vous ne pouvez télécharger que vos propres bulletins.' });
      }
    }
    // 1. Récupérer les infos de l'élève et établissement (classe la plus récente)
    const infoRes = await db.query(`
      SELECT e.*, et.nom as etablissement_nom, et.ville, et.region, et.signature_url, et.cachet_url,
        c.nom as classe_nom, c.id as classe_id, c.annee_scolaire
      FROM eleves e
      JOIN etablissements et ON e.etablissement_id = et.id
      LEFT JOIN LATERAL (
        SELECT c.nom, c.id, c.annee_scolaire
        FROM inscription_classes ic
        JOIN classes c ON ic.classe_id = c.id
        WHERE ic.eleve_id = e.id
        ORDER BY ic.date_inscription DESC
        LIMIT 1
      ) c ON true
      WHERE e.id = $1
    `, [eleveId]);

    if (infoRes.rows.length === 0) return res.status(404).json({ message: 'Élève non trouvé.' });
    const eleve = infoRes.rows[0];

    // Validation for student download
    if (req.user.role === 'ELEVE') {
      const sem = parseInt(semestre) || 1;
      if (!eleve.classe_id) {
        return res.status(400).json({ message: "Vous n'êtes inscrit dans aucune classe active actuellement." });
      }
      
      const pubCheck = await db.query(`
        SELECT autorise FROM bulletins_autorises
        WHERE classe_id = $1 AND semestre = $2 AND annee_scolaire = $3
      `, [eleve.classe_id, sem, eleve.annee_scolaire]);
      
      const autorise = pubCheck.rows.length > 0 ? pubCheck.rows[0].autorise : false;
      if (!autorise) {
        return res.status(403).json({ message: "Le téléchargement du bulletin officiel pour ce semestre n'est pas encore autorisé par l'administration de votre établissement." });
      }

      // Check if already downloaded
      const dlCheck = await db.query(`
        SELECT id FROM bulletins_telechargements
        WHERE eleve_id = $1 AND classe_id = $2 AND semestre = $3 AND annee_scolaire = $4
      `, [eleveId, eleve.classe_id, sem, eleve.annee_scolaire]);

      if (dlCheck.rows.length > 0) {
        return res.status(403).json({ message: "Ce bulletin a déjà été téléchargé. Conformément à la réglementation, il ne peut être téléchargé qu'une seule fois. Si vous l'avez égaré, veuillez contacter l'administration de votre établissement." });
      }

      // Log download
      await db.query(`
        INSERT INTO bulletins_telechargements (eleve_id, classe_id, semestre, annee_scolaire)
        VALUES ($1, $2, $3, $4)
      `, [eleveId, eleve.classe_id, sem, eleve.annee_scolaire]);
    }

    // Génération du bulletin conforme au modèle officiel sénégalais
    await generateSenegalBulletinPdf(eleveId, parseInt(semestre) || 1, res);

  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Erreur lors de la génération du bulletin.' });
    }
  }
});

router.get('/attestation/:eleveId', auth, async (req, res) => {
  const { eleveId } = req.params;
  try {
    // 1. Role validation: Teachers cannot download registration certificates
    if (req.user.role === 'PROFESSEUR') {
      return res.status(403).json({ message: 'Accès refusé. Les enseignants ne sont pas autorisés à télécharger ce document.' });
    }

    // 2. Student validation: Students can only download their own certificate
    if (req.user.role === 'ELEVE') {
      const eleveCheck = await db.query('SELECT user_id FROM eleves WHERE id = $1', [eleveId]);
      if (eleveCheck.rows.length === 0 || eleveCheck.rows[0].user_id !== req.user.id) {
        return res.status(403).json({ message: 'Accès refusé. Vous ne pouvez demander que vos propres attestations.' });
      }
    } else {
      // 3. Admin validation: Admins must be the administrator of the student's establishment
      const adminCheck = await db.query(`
        SELECT 1 
        FROM eleves e
        JOIN etablissements et ON e.etablissement_id = et.id
        WHERE e.id = $1 AND et.admin_id = $2
      `, [eleveId, req.user.id]);
      if (adminCheck.rows.length === 0) {
        return res.status(403).json({ message: 'Accès refusé. Seul l\'établissement d\'inscription de cet élève est autorisé à télécharger ce document.' });
      }
    }

    const infoRes = await db.query(`
      SELECT e.*, et.nom as etablissement_nom, et.ville as etablissement_ville, et.region as etablissement_region,
             et.signature_url, et.cachet_url, et.code_etablissement, et.nom_directeur, c.nom as classe_nom, c.id as classe_id, c.niveau, c.annee_scolaire
      FROM eleves e
      JOIN etablissements et ON e.etablissement_id = et.id
      JOIN inscription_classes ic ON e.id = ic.eleve_id
      JOIN classes c ON ic.classe_id = c.id
      WHERE e.id = $1
      ORDER BY ic.date_inscription DESC
      LIMIT 1
    `, [eleveId]);

    if (infoRes.rows.length === 0) return res.status(404).json({ message: 'Élève non trouvé.' });
    const eleve = infoRes.rows[0];

    // 4. Download-once logic: Only applies when downloaded by the student
    let requestRecord = null;
    if (req.user.role === 'ELEVE') {
      const requestCheck = await db.query(`
        SELECT id, deja_telecharge 
        FROM demandes_attestation 
        WHERE eleve_id = $1 AND classe_id = $2 AND statut = 'ACCEPTE'
        ORDER BY date_demande DESC
        LIMIT 1
      `, [eleveId, eleve.classe_id]);

      if (requestCheck.rows.length === 0) {
        return res.status(403).json({ message: 'Accès refusé. Aucune demande d\'attestation acceptée n\'a été trouvée pour votre classe actuelle.' });
      }

      requestRecord = requestCheck.rows[0];
      if (requestRecord.deja_telecharge) {
        return res.status(403).json({ message: 'Cette attestation a déjà été téléchargée. Conformément à la réglementation, elle ne peut être téléchargée qu\'une seule fois. Si vous l\'avez égarée, veuillez contacter l\'administration de votre établissement.' });
      }
    }

    // Mark as downloaded if requested by the student
    if (requestRecord) {
      await db.query(`
        UPDATE demandes_attestation 
        SET deja_telecharge = TRUE, date_telechargement = CURRENT_TIMESTAMP 
        WHERE id = $1
      `, [requestRecord.id]);
    }

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="attestation_${eleve.identifiant_national}.pdf"`);
    doc.pipe(res);

    // === Official Senegalese Header ===
    const flagPath = path.join(__dirname, '../assets/senegal_flag.png');
    const logoPath = path.join(__dirname, '../assets/senegal_education_logo.png');

    if (fs.existsSync(flagPath)) {
      doc.image(flagPath, 50, 40, { width: 75 });
    }
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 475, 35, { width: 75 });
    }

    doc.font('Helvetica-Bold').fontSize(10).text("RÉPUBLIQUE DU SÉNÉGAL", 130, 45, { align: 'center', width: 340 });
    doc.font('Helvetica-Oblique').fontSize(8).text("Un Peuple - Un But - Une Foi", 130, 58, { align: 'center', width: 340 });
    doc.font('Helvetica').fontSize(9).text("MINISTÈRE DE L'ÉDUCATION NATIONALE", 130, 72, { align: 'center', width: 340 });

    // Title box
    doc.rect(50, 115, 500, 45).stroke();
    doc.fontSize(15).font('Helvetica-Bold').text("ATTESTATION D'INSCRIPTION", 50, 130, { align: 'center', width: 500 });

    doc.font('Helvetica').fontSize(12);
    doc.text(`Je soussigné ${eleve.nom_directeur || 'Le Directeur'} de l'établissement ${eleve.etablissement_nom} (Code : ${eleve.code_etablissement}), atteste que :`, 50, 190);
    doc.moveDown(1.5);

    // Student details
    doc.font('Helvetica-Bold').fontSize(14).text(`Mme, M. ${eleve.prenom} ${eleve.nom}`, { align: 'center' });
    const dob = new Date(eleve.date_naissance).toLocaleDateString('fr-SN', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.font('Helvetica').fontSize(12).text(`né(e) le ${dob} à ${eleve.lieu_naissance || '-'}`, { align: 'center' });
    doc.font('Helvetica-Oblique').fontSize(11).text(`Identifiant National : ${eleve.identifiant_national || '-'}`, { align: 'center' });
    doc.moveDown(1.5);

    // Inscription text
    doc.text(`est régulièrement inscrit(e) à ladite école en classe de `, { continued: true });
    doc.font('Helvetica-Bold').text(`${eleve.classe_nom} (Niveau ${eleve.niveau})`, { continued: true });
    doc.font('Helvetica').text(`, pour l'année scolaire `, { continued: true });
    doc.font('Helvetica-Bold').text(`${eleve.annee_scolaire || '2025-2026'}.`);
    doc.moveDown(1.5);

    doc.text(`En foi de quoi, la présente attestation lui est délivrée sur sa demande pour servir et valoir ce que de droit.`);
    doc.moveDown(2);

    // City and Date
    const todayStr = new Date().toLocaleDateString('fr-SN', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.text(`Fait à ${eleve.etablissement_ville}, le ${todayStr}`, { align: 'right' });
    doc.moveDown();
    doc.font('Helvetica-Bold').text(eleve.nom_directeur || 'Le Directeur', { align: 'right' });

    const ySign = doc.y;

    // === Signature superposée sur le Cachet ===
    // On place les deux images au même endroit (colonne droite)
    // Le cachet est positionné en premier (couche du bas)
    // La signature est dessinée par-dessus, centrée sur le cachet
    const signatureX = 340;  // position X colonne droite
    const cachetX    = 330;  // légèrement décalé pour l'aspect naturel
    const cachetY    = ySign - 45;
    const signatureY = ySign - 25;
    const cachetWidth    = 190;
    const signatureWidth = 170;

    if (eleve.cachet_url) {
      const cachPath = path.join(__dirname, '../../', eleve.cachet_url);
      if (fs.existsSync(cachPath)) {
        // Cachet en premier (dessous)
        doc.image(cachPath, cachetX, cachetY, { width: cachetWidth });
      }
    }

    if (eleve.signature_url) {
      const sigPath = path.join(__dirname, '../../', eleve.signature_url);
      if (fs.existsSync(sigPath)) {
        // Signature par-dessus le cachet (superposée)
        doc.image(sigPath, signatureX, signatureY, { width: signatureWidth });
      }
    }

    doc.moveDown(6);

    // Footnotes and branding footer
    doc.font('Helvetica-Oblique').fontSize(8);
    doc.text(`1. Cette pièce administrative est délivrée une seule fois, il vous appartient d'en faire des copies certifiées.`, 50, 680);
    doc.text(`2. Rayer la mention inutile.`, 50, 692);

    doc.moveTo(50, 710).lineTo(550, 710).stroke();

    doc.font('Helvetica-Bold').fontSize(8).text(`${eleve.etablissement_nom.toUpperCase()} - VILLE : ${eleve.etablissement_ville.toUpperCase()} - REGION : ${eleve.etablissement_region?.toUpperCase() || '-'}`, 50, 720, { align: 'center', width: 500 });
    doc.font('Helvetica').fontSize(8).text(`Code Établissement : ${eleve.code_etablissement} | Document généré numériquement de manière authentique`, 50, 732, { align: 'center', width: 500 });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// --- DOSSIER DE TRANSFERT ---
router.get('/dossier-transfert/:eleveId', auth, async (req, res) => {
  const { eleveId } = req.params;
  try {
    if (req.user.role === 'ELEVE') {
      const eleveCheck = await db.query('SELECT user_id FROM eleves WHERE id = $1', [eleveId]);
      if (eleveCheck.rows.length === 0 || eleveCheck.rows[0].user_id !== req.user.id) {
        return res.status(403).json({ message: 'Accès refusé. Vous ne pouvez télécharger que votre propre dossier de transfert.' });
      }
    }
    // 1. Infos élève + établissement
    const infoRes = await db.query(`
      SELECT e.*, et.nom as etablissement_nom, et.ville, et.region, et.code_etablissement,
        et.signature_url, et.cachet_url
      FROM eleves e
      JOIN etablissements et ON e.etablissement_id = et.id
      WHERE e.id = $1
    `, [eleveId]);
    if (infoRes.rows.length === 0) return res.status(404).json({ message: 'Élève non trouvé.' });
    const eleve = infoRes.rows[0];

    // 2. Historique des classes
    const classesRes = await db.query(`
      SELECT c.nom as classe_nom, c.niveau, c.annee_scolaire, ic.date_inscription
      FROM inscription_classes ic
      JOIN classes c ON ic.classe_id = c.id
      WHERE ic.eleve_id = $1
      ORDER BY ic.date_inscription DESC
    `, [eleveId]);

    // 3. Notes par classe et semestre
    const notesRes = await db.query(`
      SELECT 
        m.nom as matiere_nom, n.valeur, COALESCE(n.coefficient, 1) as coefficient,
        n.appreciation, n.type_note, n.semestre,
        u.email as professeur_email
      FROM notes n
      JOIN matieres m ON n.matiere_id = m.id
      LEFT JOIN users u ON n.professeur_id = u.id
      WHERE n.eleve_id = $1
      ORDER BY n.semestre, m.nom
    `, [eleveId]);

    // 3b. Récupérer la classe actuelle
    const classeActuelleRes = await db.query(`
      SELECT c.nom as classe_nom, c.niveau, c.annee_scolaire
      FROM inscription_classes ic
      JOIN classes c ON ic.classe_id = c.id
      WHERE ic.eleve_id = $1
      ORDER BY ic.date_inscription DESC
      LIMIT 1
    `, [eleveId]);
    const classeActuelle = classeActuelleRes.rows[0] || null;

    // 4. Transferts
    const transferRes = await db.query(`
      SELECT t.*, et.nom as ancien_etablissement_nom, et2.nom as nouveau_etablissement_nom
      FROM transferts_eleves t
      LEFT JOIN etablissements et ON t.ancien_etablissement_id = et.id
      LEFT JOIN etablissements et2 ON t.nouveau_etablissement_id = et2.id
      WHERE t.eleve_id = $1
      ORDER BY t.date_transfert DESC
    `, [eleveId]);

    // 5. QR Code
    const qrData = `LeralScolaire - Dossier Transfert - ${eleve.nom} ${eleve.prenom} - ID: ${eleve.identifiant_national}`;
    const qrCodeImage = await QRCode.toDataURL(qrData);

    // 6. Génération PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const fileName = `dossier_transfert_${eleve.identifiant_national}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    doc.pipe(res);

    const blue = '#1e40af';
    const gray = '#6b7280';
    const lightGray = '#f3f4f6';

    // --- EN-TÊTE ---
    doc.fontSize(20).fillColor(blue).text('DOSSIER DE TRANSFERT', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(12).fillColor(gray).text('Document officiel - LeralScolaire', { align: 'center' });
    doc.moveDown(0.8);

    // Établissement
    doc.rect(50, doc.y, 495, 45).fill('#eff6ff');
    doc.fillColor(blue).fontSize(13).text(eleve.etablissement_nom, 60, doc.y + 5);
    doc.fillColor(gray).fontSize(10).text(`${eleve.ville}, ${eleve.region} - Code: ${eleve.code_etablissement}`, 60, doc.y + 5);
    doc.fillColor(gray).fontSize(9).text(`Date d'émission : ${new Date().toLocaleDateString('fr-SN')}`, 60, doc.y + 5);
    doc.moveDown(1.5);

    // QR Code
    doc.image(qrCodeImage, 460, 55, { width: 70 });

    // --- IDENTITÉ DE L'ÉLÈVE ---
    doc.fillColor(blue).fontSize(14).text('IDENTITÉ DE L\'ÉLÈVE', 50, doc.y);
    doc.moveDown(0.5);
    doc.rect(50, doc.y - 5, 495, 1).fill(blue);
    doc.moveDown(0.8);

    const labelX = 60;
    const valueX = 200;
    let y = doc.y;

    doc.fontSize(10).fillColor(gray);
    const infoLines = [
      { label: 'Nom', value: eleve.nom },
      { label: 'Prénom', value: eleve.prenom },
      { label: 'Date de naissance', value: new Date(eleve.date_naissance).toLocaleDateString('fr-SN') },
      { label: 'Lieu de naissance', value: eleve.lieu_naissance || '--' },
      { label: 'Nationalité', value: eleve.nationalite || '--' },
      { label: 'Téléphone', value: eleve.telephone || '--' },
      { label: 'Identifiant national', value: eleve.identifiant_national },
      { label: 'Coordonnées parent', value: eleve.coordonnees_parent || '--' },
    ];

    infoLines.forEach((item, i) => {
      const col = i % 2 === 0 ? 0 : 1;
      const row = Math.floor(i / 2);
      const x = col === 0 ? labelX : labelX + 260;
      const yy = y + row * 18;
      doc.fillColor(gray).fontSize(9).text(item.label, x, yy);
      doc.fillColor('#111827').fontSize(10).text(item.value, x + 90, yy);
    });

    doc.moveDown(infoLines.length % 2 === 0 ? 1.5 : 2);

    // --- HISTORIQUE SCOLAIRE ---
    if (classesRes.rows.length > 0) {
      doc.fillColor(blue).fontSize(14).text('PARCOURS SCOLAIRE', 50, doc.y);
      doc.moveDown(0.5);
      doc.rect(50, doc.y - 5, 495, 1).fill(blue);
      doc.moveDown(0.8);

      y = doc.y;
      classesRes.rows.forEach((c, i) => {
        if (i > 0) y += 18;
        if (i === 0) {
          doc.rect(50, y, 495, 18).fill('#f0fdf4');
          doc.fillColor('#16a34a').fontSize(10).font('Helvetica-Bold').text(`${c.classe_nom} (${c.niveau})`, 60, y + 4);
          doc.fillColor('#16a34a').fontSize(10).text(`${c.annee_scolaire}`, 350, y + 4);
        } else {
          doc.fillColor('#111827').fontSize(10).text(`${c.classe_nom} (${c.niveau})`, 60, y + 4);
          doc.fillColor(gray).fontSize(10).text(`${c.annee_scolaire}`, 350, y + 4);
        }
      });
      doc.moveDown(2);
    }

    // --- NOTES PAR SEMESTRE ---
    if (notesRes.rows.length > 0) {
      doc.fillColor(blue).fontSize(14).text('RELEVÉ DE NOTES', 50, doc.y);
      doc.moveDown(0.5);
      doc.rect(50, doc.y - 5, 495, 1).fill(blue);
      doc.moveDown(0.8);

      // Grouper par semestre puis par matière
      const semestreGroups = {};
      notesRes.rows.forEach(n => {
        const key = `S${n.semestre}`;
        if (!semestreGroups[key]) {
          semestreGroups[key] = { semestre: n.semestre, matieres: {} };
        }
        if (!semestreGroups[key].matieres[n.matiere_nom]) {
          semestreGroups[key].matieres[n.matiere_nom] = { devoir: null, examen: null, appreciation: '', coeff: n.coefficient };
        }
        if (n.type_note === 'DEVOIR') {
          semestreGroups[key].matieres[n.matiere_nom].devoir = parseFloat(n.valeur);
          if (n.appreciation) semestreGroups[key].matieres[n.matiere_nom].appreciation = n.appreciation;
        } else if (n.type_note === 'EXAMEN' || n.type_note === 'COMPOSITION') {
          semestreGroups[key].matieres[n.matiere_nom].examen = parseFloat(n.valeur);
          if (n.appreciation) semestreGroups[key].matieres[n.matiere_nom].appreciation = n.appreciation;
        }
      });

      const classLabel = classeActuelle ? `${classeActuelle.classe_nom} (${classeActuelle.niveau}) - ${classeActuelle.annee_scolaire}` : '';

      Object.keys(semestreGroups).forEach(key => {
        const group = semestreGroups[key];
        y = doc.y;
        if (y > 650) { doc.addPage(); y = 50; }

        doc.rect(50, y, 495, 20).fill(lightGray);
        doc.fillColor(blue).fontSize(11).font('Helvetica-Bold')
          .text(`${classLabel} - Semestre ${group.semestre}`, 60, y + 4);
        doc.moveDown(2);

        y = doc.y;
        const colM = 60;
        const colDevoir = 190;
        const colExamen = 260;
        const colMoy = 330;
        const colCoeff = 390;
        const colAppr = 430;

        doc.fontSize(9).fillColor(gray).font('Helvetica-Bold');
        doc.text('Matière', colM, y);
        doc.text('Devoir', colDevoir, y);
        doc.text('Examen', colExamen, y);
        doc.text('Moyenne', colMoy, y);
        doc.text('Coeff', colCoeff, y);
        doc.text('Appréciation', colAppr, y);
        doc.moveDown(0.5);
        doc.rect(50, doc.y, 495, 1).fill(gray);
        doc.moveDown(0.5);

        doc.font('Helvetica').fontSize(9);
        let totalPoints = 0;
        let totalCoeff = 0;

        Object.keys(group.matieres).forEach(matiereNom => {
          const m = group.matieres[matiereNom];
          y = doc.y;
          if (y > 700) { doc.addPage(); y = 50; }

          const devoirVal = m.devoir !== null ? m.devoir : null;
          const examenVal = m.examen !== null ? m.examen : null;
          const notesArr = [devoirVal, examenVal].filter(v => v !== null);
          const moyenne = notesArr.length > 0 ? notesArr.reduce((a, b) => a + b, 0) / notesArr.length : null;

          doc.fillColor('#111827').text(matiereNom, colM, y);
          if (devoirVal !== null) {
            doc.fillColor(devoirVal >= 10 ? '#16a34a' : '#dc2626').text(devoirVal.toFixed(2), colDevoir, y);
          } else {
            doc.fillColor(gray).text('-', colDevoir, y);
          }
          if (examenVal !== null) {
            doc.fillColor(examenVal >= 10 ? '#16a34a' : '#dc2626').text(examenVal.toFixed(2), colExamen, y);
          } else {
            doc.fillColor(gray).text('-', colExamen, y);
          }
          if (moyenne !== null) {
            doc.fillColor(blue).font('Helvetica-Bold').text(moyenne.toFixed(2), colMoy, y);
            totalPoints += moyenne * m.coeff;
            totalCoeff += m.coeff;
          } else {
            doc.fillColor(gray).font('Helvetica').text('-', colMoy, y);
          }
          doc.fillColor('#111827').font('Helvetica').text(m.coeff.toString(), colCoeff, y);
          doc.fillColor('#111827').text(m.appreciation || '-', colAppr, y, { width: 70 });
          doc.moveDown(0.8);
        });

        doc.moveDown(0.3);
        doc.rect(50, doc.y, 495, 1).fill(gray);
        doc.moveDown(0.5);
        const moyGenerale = totalCoeff > 0 ? (totalPoints / totalCoeff).toFixed(2) : '--';
        doc.fillColor(blue).fontSize(11).font('Helvetica-Bold')
          .text(`Moyenne Générale : ${moyGenerale} / 20`, colM, doc.y);
        doc.moveDown(1.5);
      });
    }

    // --- TRANSFERTS ---
    if (transferRes.rows.length > 0) {
      doc.fillColor(blue).fontSize(14).text('HISTORIQUE DES TRANSFERTS', 50, doc.y);
      doc.moveDown(0.5);
      doc.rect(50, doc.y - 5, 495, 1).fill(blue);
      doc.moveDown(0.8);

      transferRes.rows.forEach(t => {
        doc.fontSize(10).fillColor('#111827')
          .text(`De: ${t.ancien_etablissement_nom || '--'} → ${t.nouveau_etablissement_nom || '--'}`, 60, doc.y);
        doc.fillColor(gray).fontSize(9)
          .text(`Date: ${new Date(t.date_transfert).toLocaleDateString('fr-SN')} - Motif: ${t.motif || '--'}`, 60, doc.y);
        doc.moveDown(0.8);
      });
      doc.moveDown(1);
    }

    // --- SIGNATURES ---
    doc.moveDown(2);
    doc.rect(50, doc.y, 495, 1).fill(gray);
    doc.moveDown(1.5);
    doc.fontSize(11).fillColor('#111827').text(`Fait à ${eleve.ville}, le ${new Date().toLocaleDateString('fr-SN')}`, { align: 'right' });
    doc.moveDown(0.5);
    doc.text("Cachet et signature de l'établissement", { align: 'right' });
    doc.moveDown(1);

    // Espace cachet
    doc.rect(400, doc.y, 100, 80).stroke(gray);
    doc.fillColor(gray).fontSize(9).text('Cachet officiel', 420, doc.y + 30);

    // --- ANNEXES : BULLETINS OFFICIELS SÉNÉGALAIS ---
    try {
      const { getBulletinData, drawSenegalBulletin } = require('../utils/senegalBulletinPdfService');
      const b1Data = await getBulletinData(eleveId, 1);
      if (b1Data) {
        doc.addPage();
        await drawSenegalBulletin(doc, b1Data);
      }
      const b2Data = await getBulletinData(eleveId, 2);
      if (b2Data) {
        doc.addPage();
        await drawSenegalBulletin(doc, b2Data);
      }
    } catch (bulletinErr) {
      console.error('Erreur annexe bulletins dans dossier transfert:', bulletinErr);
    }

    doc.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la génération du dossier.' });
  }
});

// --- ATTESTATION REQUESTS FOR ESTABLISHMENTS ---

// Get all requests for the current establishment
router.get('/attestations/requests', auth, async (req, res) => {
  try {
    const etabRes = await db.query('SELECT id FROM etablissements WHERE admin_id = $1', [req.user.id]);
    if (etabRes.rows.length === 0) {
      return res.status(404).json({ message: 'Établissement non trouvé.' });
    }
    const etabId = etabRes.rows[0].id;

    const query = `
      SELECT da.*, e.nom as eleve_nom, e.prenom as eleve_prenom, e.identifiant_national, c.nom as classe_nom
      FROM demandes_attestation da
      JOIN eleves e ON da.eleve_id = e.id
      LEFT JOIN (
        SELECT ic.eleve_id, ic.classe_id
        FROM inscription_classes ic
        INNER JOIN (
          SELECT eleve_id, MAX(date_inscription) as max_date
          FROM inscription_classes
          GROUP BY eleve_id
        ) latest ON ic.eleve_id = latest.eleve_id AND ic.date_inscription = latest.max_date
      ) lic ON e.id = lic.eleve_id
      LEFT JOIN classes c ON lic.classe_id = c.id
      WHERE da.etablissement_id = $1
      ORDER BY da.date_demande DESC
    `;
    const result = await db.query(query, [etabId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération des demandes.' });
  }
});

// Accept a request
router.post('/attestations/requests/:id/accept', auth, async (req, res) => {
  const { id } = req.params;
  try {
    const etabRes = await db.query('SELECT id FROM etablissements WHERE admin_id = $1', [req.user.id]);
    if (etabRes.rows.length === 0) {
      return res.status(404).json({ message: 'Établissement non trouvé.' });
    }
    const etabId = etabRes.rows[0].id;

    const result = await db.query(
      `UPDATE demandes_attestation 
       SET statut = 'ACCEPTE', date_traitement = CURRENT_TIMESTAMP 
       WHERE id = $1 AND etablissement_id = $2 RETURNING *`,
      [id, etabId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Demande non trouvée ou non autorisée.' });
    }

    res.json({ message: 'Demande acceptée avec succès.', demande: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur.' });
  }
});

// Refuse a request
router.post('/attestations/requests/:id/refuse', auth, async (req, res) => {
  const { id } = req.params;
  const { motif_refus } = req.body;
  try {
    const etabRes = await db.query('SELECT id FROM etablissements WHERE admin_id = $1', [req.user.id]);
    if (etabRes.rows.length === 0) {
      return res.status(404).json({ message: 'Établissement non trouvé.' });
    }
    const etabId = etabRes.rows[0].id;

    const result = await db.query(
      `UPDATE demandes_attestation 
       SET statut = 'REFUSE', motif_refus = $1, date_traitement = CURRENT_TIMESTAMP 
       WHERE id = $2 AND etablissement_id = $3 RETURNING *`,
      [motif_refus, id, etabId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Demande non trouvée ou non autorisée.' });
    }

    res.json({ message: 'Demande refusée avec succès.', demande: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur.' });
  }
});

// --- CLASSEMENT PDF DE LA CLASSE ---
router.get('/classe/:classeId/classement-pdf', auth, async (req, res) => {
  const { classeId } = req.params;
  const { period } = req.query; // ex: 'Semestre 1', 'Semestre 2', etc.

  try {
    // 1. Fetch class and establishment info
    const classeRes = await db.query(`
      SELECT c.*, et.nom as etablissement_nom, et.ville, et.region
      FROM classes c
      JOIN etablissements et ON c.etablissement_id = et.id
      WHERE c.id = $1
    `, [classeId]);

    if (classeRes.rows.length === 0) {
      return res.status(404).json({ message: 'Classe non trouvée.' });
    }
    const classe = classeRes.rows[0];

    // 2. Fetch all students in the class
    const studentsRes = await db.query(`
      SELECT e.id, e.nom, e.prenom, e.identifiant_national
      FROM eleves e
      JOIN inscription_classes ic ON e.id = ic.eleve_id
      WHERE ic.classe_id = $1
      ORDER BY e.nom, e.prenom
    `, [classeId]);

    const students = studentsRes.rows;

    // Parse the period
    let semestre = null;
    let trimestre = null;
    if (period) {
      if (period.startsWith('Semestre')) {
        semestre = parseInt(period.split(' ')[1]) || null;
      } else if (period.startsWith('Trimestre')) {
        trimestre = parseInt(period.split(' ')[1]) || null;
      }
    }

    // 3. Fetch all notes for this class and period
    let notesQuery = `
      SELECT n.eleve_id, n.valeur, n.type_note, m.code_matiere, 
             COALESCE(cm.coefficient, n.coefficient, 1) as coefficient
      FROM notes n
      JOIN matieres m ON n.matiere_id = m.id
      LEFT JOIN inscription_classes ic ON n.eleve_id = ic.eleve_id
      LEFT JOIN classes c ON ic.classe_id = c.id
      LEFT JOIN classe_matieres cm ON cm.classe_id = c.id AND cm.matiere_id = n.matiere_id
      WHERE ic.classe_id = $1
    `;
    const queryParams = [classeId];

    if (semestre !== null) {
      notesQuery += ` AND n.semestre = $2`;
      queryParams.push(semestre);
    } else if (trimestre !== null) {
      notesQuery += ` AND n.trimestre = $2`;
      queryParams.push(trimestre);
    }

    const notesRes = await db.query(notesQuery, queryParams);
    const allNotes = notesRes.rows;

    // 4. Fetch saved bulletins to get decisions if any
    const bulletinsRes = await db.query(`
      SELECT eleve_id, decision, decision_detail
      FROM bulletins
      WHERE classe_id = $1 AND annee_scolaire = $2
    `, [classeId, classe.annee_scolaire]);
    const bulletins = bulletinsRes.rows;

    // 5. Compute general averages
    const studentAverages = students.map(student => {
      const studentNotes = allNotes.filter(n => n.eleve_id === student.id);
      
      const matieres = {};
      studentNotes.forEach(n => {
        if (!matieres[n.code_matiere]) {
          matieres[n.code_matiere] = {
            coefficient: n.coefficient,
            notes: []
          };
        }
        matieres[n.code_matiere].notes.push(parseFloat(n.valeur));
      });

      let totalPoints = 0;
      let totalCoefficients = 0;

      for (const codeMat of Object.keys(matieres)) {
        const mat = matieres[codeMat];
        if (mat.notes.length > 0) {
          const sum = mat.notes.reduce((a, b) => a + b, 0);
          const moyenneMatiere = sum / mat.notes.length;
          totalPoints += moyenneMatiere * mat.coefficient;
          totalCoefficients += mat.coefficient;
        }
      }

      const average = totalCoefficients > 0 
        ? parseFloat((totalPoints / totalCoefficients).toFixed(2)) 
        : null;

      const savedB = bulletins.find(b => b.eleve_id === student.id);

      return {
        nom: student.nom,
        prenom: student.prenom,
        identifiant_national: student.identifiant_national,
        moyenne_generale: average,
        decision_detail: savedB ? savedB.decision_detail : ''
      };
    });

    // 6. Sort by average
    studentAverages.sort((a, b) => {
      if (a.moyenne_generale === null && b.moyenne_generale === null) return 0;
      if (a.moyenne_generale === null) return 1;
      if (b.moyenne_generale === null) return -1;
      return b.moyenne_generale - a.moyenne_generale;
    });

    // Add ranks
    let rank = 1;
    let prevAvg = null;
    const rankedStudents = studentAverages.map((student, index) => {
      if (student.moyenne_generale !== null) {
        if (prevAvg !== null && student.moyenne_generale < prevAvg) {
          rank = index + 1;
        }
        prevAvg = student.moyenne_generale;
        return { ...student, rang: rank };
      } else {
        return { ...student, rang: null };
      }
    });

    // 7. Generate PDF
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const safeClassName = classe.nom.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `classement_${safeClassName}_${period.replace(/\s+/g, '_')}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    doc.pipe(res);

    // Header styling
    doc.font('Helvetica-Bold').fontSize(14).text(classe.etablissement_nom.toUpperCase(), { align: 'center' });
    doc.font('Helvetica').fontSize(10).text(`${classe.ville || ''} - ${classe.region || ''}`, { align: 'center' });
    doc.moveDown(0.5);
    doc.font('Helvetica-Oblique').fontSize(9).text(`Année Scolaire : ${classe.annee_scolaire}`, { align: 'center' });
    doc.moveDown(1.5);

    // Document Title
    doc.font('Helvetica-Bold').fontSize(14).fillColor('#1e3a8a').text(`PALMARÈS & CLASSEMENT GÉNÉRAL`, { align: 'center' });
    doc.fontSize(12).text(`Classe : ${classe.nom}   |   Période : ${period}`, { align: 'center' });
    doc.fillColor('black');
    doc.moveDown(1.5);

    // Table Header
    const tableTop = doc.y;
    const colRang = 40;
    const colID = 90;
    const colNom = 210;
    const colMoy = 400;
    const colDec = 480;

    doc.rect(colRang, tableTop, 515, 20).fill('#f1f5f9');
    doc.fillColor('#1e293b').font('Helvetica-Bold').fontSize(10);
    doc.text('Rang', colRang + 10, tableTop + 5);
    doc.text('Identifiant', colID + 10, tableTop + 5);
    doc.text('Nom & Prénoms', colNom + 10, tableTop + 5);
    doc.text('Moyenne', colMoy + 10, tableTop + 5);
    doc.text('Décision', colDec + 10, tableTop + 5);

    doc.strokeColor('#cbd5e1').lineWidth(0.5);
    doc.moveTo(colRang, tableTop + 20).lineTo(colRang + 515, tableTop + 20).stroke();

    let currentY = tableTop + 20;

    // Table rows
    rankedStudents.forEach((student) => {
      // Check if page needs to be added
      if (currentY > 750) {
        doc.addPage();
        currentY = 40;
        doc.rect(colRang, currentY, 515, 20).fill('#f1f5f9');
        doc.fillColor('#1e293b').font('Helvetica-Bold').fontSize(10);
        doc.text('Rang', colRang + 10, currentY + 5);
        doc.text('Identifiant', colID + 10, currentY + 5);
        doc.text('Nom & Prénoms', colNom + 10, currentY + 5);
        doc.text('Moyenne', colMoy + 10, currentY + 5);
        doc.text('Décision', colDec + 10, currentY + 5);
        doc.strokeColor('#cbd5e1').lineWidth(0.5);
        doc.moveTo(colRang, currentY + 20).lineTo(colRang + 515, currentY + 20).stroke();
        currentY += 20;
      }

      doc.fillColor('black').font('Helvetica').fontSize(9);
      
      // Zebra striping background
      if (student.rang && student.rang % 2 === 0) {
        doc.rect(colRang, currentY, 515, 20).fill('#f8fafc');
        doc.fillColor('black');
      }

      // Highlighting top 3
      if (student.rang === 1) {
        doc.fillColor('#b45309').font('Helvetica-Bold'); // Gold
      } else if (student.rang === 2) {
        doc.fillColor('#475569').font('Helvetica-Bold'); // Silver
      } else if (student.rang === 3) {
        doc.fillColor('#78350f').font('Helvetica-Bold'); // Bronze
      }

      const rangText = student.rang ? `${student.rang}${student.rang === 1 ? 'er' : 'e'}` : '--';
      const avgText = student.moyenne_generale !== null ? `${student.moyenne_generale.toFixed(2)}/20` : '--';

      doc.text(rangText, colRang + 10, currentY + 6);
      doc.font('Helvetica'); // Reset font style for names
      doc.text(student.identifiant_national || '--', colID + 10, currentY + 6);
      
      const fullName = `${student.nom.toUpperCase()} ${student.prenom}`;
      doc.text(fullName, colNom + 10, currentY + 6, { width: 180, ellipsis: true });
      
      // Bold only the average
      doc.font('Helvetica-Bold');
      doc.text(avgText, colMoy + 10, currentY + 6);
      doc.font('Helvetica');

      // Style decision
      let decColor = 'black';
      if (student.decision_detail) {
        if (student.decision_detail.toLowerCase().includes('passage')) {
          decColor = '#059669'; // Green
        } else if (student.decision_detail.toLowerCase().includes('redoublement')) {
          decColor = '#dc2626'; // Red
        }
      }
      doc.fillColor(decColor).text(student.decision_detail || '--', colDec + 10, currentY + 6);

      doc.strokeColor('#e2e8f0').lineWidth(0.5);
      doc.moveTo(colRang, currentY + 20).lineTo(colRang + 515, currentY + 20).stroke();
      
      currentY += 20;
    });

    // Signature Block
    doc.moveDown(2);
    const signatureY = doc.y;
    if (signatureY < 700) {
      doc.fontSize(9).font('Helvetica-Bold');
      doc.text("Le Secrétaire Général", 60, signatureY);
      doc.text("Le Chef d'Établissement", 380, signatureY);
    }

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la génération du classement PDF.' });
  }
});

module.exports = router;
