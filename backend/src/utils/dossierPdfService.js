const { getBulletinData, drawSenegalBulletin } = require('./senegalBulletinPdfService');

async function generateDossierScolairePdf(eleveData, signalementsList, etablissementData, res) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  // Stream PDF to HTTP response
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="Dossier_Scolaire_${eleveData.nom}_${eleveData.prenom}.pdf"`);
  doc.pipe(res);

  // En-tête République du Sénégal / Établissement
  doc.font('Helvetica-Bold').fontSize(14).fillColor('#1e293b').text('RÉPUBLIQUE DU SÉNÉGAL', { align: 'center' });
  doc.font('Helvetica').fontSize(10).fillColor('#64748b').text('Ministère de l\'Éducation Nationale', { align: 'center' });
  doc.moveDown(0.5);

  doc.font('Helvetica-Bold').fontSize(16).fillColor('#0f172a').text(etablissementData?.nom || 'LERALSCOLAIRE - ÉTABLISSEMENT SCOLAIRE', { align: 'center' });
  if (etablissementData?.region || etablissementData?.ville) {
    doc.font('Helvetica').fontSize(9).fillColor('#64748b').text(`${etablissementData.ville || ''} ${etablissementData.region ? '(' + etablissementData.region + ')' : ''}`, { align: 'center' });
  }
  doc.moveDown(1);

  // Ligne de séparation
  doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor('#e2e8f0').lineWidth(1.5).stroke();
  doc.moveDown(1);

  // Titre du Document
  doc.rect(40, doc.y, 515, 32).fillAndStroke('#f8fafc', '#cbd5e1');
  doc.fillColor('#1e3a8a').font('Helvetica-Bold').fontSize(14).text('DOSSIER SCOLAIRE INDIVIDUEL', 50, doc.y - 23, { align: 'center' });
  doc.moveDown(1.5);

  // Section 1 : État Civil & Identité de l'Élève
  doc.font('Helvetica-Bold').fontSize(12).fillColor('#0f172a').text('1. INFORMATIONS DE L\'ÉLÈVE');
  doc.moveDown(0.3);

  const startY = doc.y;
  doc.rect(40, startY, 515, 80).fillAndStroke('#ffffff', '#e2e8f0');

  doc.font('Helvetica-Bold').fontSize(10).fillColor('#334155');
  doc.text(`Nom : `, 55, startY + 12, { continued: true }).font('Helvetica').text(`${eleveData.nom || 'N/A'}`);
  doc.font('Helvetica-Bold').text(`Prénom : `, 55, startY + 28, { continued: true }).font('Helvetica').text(`${eleveData.prenom || 'N/A'}`);
  doc.font('Helvetica-Bold').text(`Identifiant National : `, 55, startY + 44, { continued: true }).font('Helvetica').text(`${eleveData.identifiant_national || eleveData.ine || 'N/A'}`);
  doc.font('Helvetica-Bold').text(`Date de Naissance : `, 55, startY + 60, { continued: true }).font('Helvetica').text(`${eleveData.date_naissance ? new Date(eleveData.date_naissance).toLocaleDateString('fr-FR') : 'N/A'}`);

  doc.font('Helvetica-Bold').text(`Sexe : `, 310, startY + 12, { continued: true }).font('Helvetica').text(`${eleveData.sexe || 'N/A'}`);
  doc.font('Helvetica-Bold').text(`Classe Actuelle : `, 310, startY + 28, { continued: true }).font('Helvetica').text(`${eleveData.classe_nom || 'Non attribuée'}`);
  doc.font('Helvetica-Bold').text(`Téléphone Parent : `, 310, startY + 44, { continued: true }).font('Helvetica').text(`${eleveData.telephone_parent || 'N/A'}`);
  doc.font('Helvetica-Bold').text(`Adresse Parent : `, 310, startY + 60, { continued: true }).font('Helvetica').text(`${eleveData.adresse_parent || 'N/A'}`);

  doc.y = startY + 95;

  // Section 2 : Registre Vie Scolaire, Remarques & Discipline
  doc.font('Helvetica-Bold').fontSize(12).fillColor('#0f172a').text('2. REGISTRE DISCIPLINAIRE & REMARQUES PÉDAGOGIQUES');
  doc.moveDown(0.5);

  if (!signalementsList || signalementsList.length === 0) {
    doc.rect(40, doc.y, 515, 30).fillAndStroke('#f0fdf4', '#bbf7d0');
    doc.fillColor('#166534').font('Helvetica').fontSize(10).text('Aucune remarque négative ni convocation enregistrée. Dossier disciplinaire vierge.', 55, doc.y - 20);
    doc.moveDown(1.5);
  } else {
    signalementsList.forEach((item, index) => {
      if (doc.y > 700) {
        doc.addPage();
      }

      const itemY = doc.y;
      let badgeBg = '#f1f5f9';
      let badgeText = '#334155';

      if (item.gravite === 'ENCOURAGEMENT') { badgeBg = '#dcfce7'; badgeText = '#166534'; }
      else if (item.gravite === 'AVERTISSEMENT') { badgeBg = '#ffedd5'; badgeText = '#9a3412'; }
      else if (item.gravite === 'GRAVE') { badgeBg = '#fee2e2'; badgeText = '#991b1b'; }
      else if (item.type_action === 'CONVOCATION') { badgeBg = '#dbeafe'; badgeText = '#1e40af'; }

      doc.rect(40, itemY, 515, 50).fillAndStroke(badgeBg, '#cbd5e1');

      const dateStr = new Date(item.created_at).toLocaleDateString('fr-FR');
      const auteurStr = item.auteur_nom_complet || (item.matiere_nom ? `Professeur de ${item.matiere_nom}` : 'Administration');

      doc.font('Helvetica-Bold').fontSize(9).fillColor(badgeText)
         .text(`[${item.type_action}] - ${item.motif}`, 50, itemY + 8);

      doc.font('Helvetica').fontSize(8).fillColor('#475569')
         .text(`Date : ${dateStr} | Émetteur : ${auteurStr} ${item.statut ? '| Statut : ' + item.statut : ''}`, 50, itemY + 22);

      if (item.description) {
        doc.font('Helvetica-Oblique').fontSize(8).fillColor('#334155')
           .text(`" ${item.description} "`, 50, itemY + 34, { width: 495, height: 12 });
      }

      doc.y = itemY + 56;
    });
  }

  // Section 3 : Bulletins Officiels (1er et 2ème Semestre)
  try {
    const eleveId = eleveData.id;
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
  } catch (err) {
    console.error('Erreur lors de l\'intégration des bulletins dans le dossier scolaire:', err);
  }

  doc.end();
}

module.exports = {
  generateDossierScolairePdf
};
