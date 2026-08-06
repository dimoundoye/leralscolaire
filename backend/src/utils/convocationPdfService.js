const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateConvocationPDF = (juryData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });

      const cleanJuryName = (juryData.numero_jury || 'Jury').replace(/\s+/g, '_');
      const fileName = `Convocation_Officielle_${cleanJuryName}_${Date.now()}.pdf`;
      const uploadsDir = path.join(__dirname, '../../uploads/messages');
      const publicUploadsDir = path.join(__dirname, '../../../frontend/public/uploads/messages');

      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      if (!fs.existsSync(publicUploadsDir)) fs.mkdirSync(publicUploadsDir, { recursive: true });

      const filePath = path.join(uploadsDir, fileName);
      const publicFilePath = path.join(publicUploadsDir, fileName);

      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // --- EN-TÊTE OFFICIEL SÉNÉGAL ---
      doc.fillColor('#000000')
         .fontSize(10)
         .font('Helvetica-Bold')
         .text('RÉPUBLIQUE DU SÉNÉGAL', { align: 'center' })
         .fontSize(8)
         .font('Helvetica-Oblique')
         .text('Un Peuple - Un But - Une Foi', { align: 'center' })
         .moveDown(0.3);

      doc.fontSize(9)
         .font('Helvetica-Bold')
         .text('MINISTÈRE DE L\'ÉDUCATION NATIONALE', { align: 'center' })
         .text('OFFICE DU BACCALAURÉAT ET DES EXAMENS NATIONAUX', { align: 'center' })
         .moveDown(1);

      // Ligne séparatrice aux couleurs nationales
      const startX = 50;
      const y = doc.y;
      doc.rect(startX, y, 165, 3).fill('#00853f'); // Vert
      doc.rect(startX + 165, y, 165, 3).fill('#fdef42'); // Jaune
      doc.rect(startX + 330, y, 165, 3).fill('#e31b23'); // Rouge
      doc.moveDown(1.5);

      // --- TITRE DU DOCUMENT ---
      doc.fillColor('#131e6c')
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('CONVOCATION OFFICIELLE DE PRÉSIDENT DE JURY', { align: 'center' })
         .fontSize(10)
         .font('Helvetica')
         .text(`Session ${juryData.type_examen || 'BAC'} ${juryData.annee || 2026}`, { align: 'center' })
         .moveDown(1.5);

      // --- CARTOUCHE INFORMATIONS DU PRÉSIDENT ---
      const infoY = doc.y;
      doc.rect(50, infoY, 495, 110)
         .fillAndStroke('#f8fafc', '#cbd5e1');

      doc.fillColor('#0f172a')
         .fontSize(10)
         .font('Helvetica-Bold')
         .text(`Destinataire : ${juryData.president_jury || 'Pr. Président de Jury'}`, 65, infoY + 12)
         .font('Helvetica')
         .fontSize(9)
         .text(`Numéro du Jury Attribué : ${juryData.numero_jury}`, 65, infoY + 30)
         .text(`Centre d'Examen Hôte : ${juryData.centre_examen} (${juryData.region || 'Dakar'})`, 65, infoY + 48)
         .text(`Zone / Commune : ${juryData.zone_commune || 'Centre'}`, 65, infoY + 66)
         .text(`Séries Autorisées : ${juryData.series_autorisees || 'Toutes séries'}`, 65, infoY + 84);

      doc.y = infoY + 125;

      // --- CARTOUCHE SÉCURISÉ DES ACCÈS TEMPORAIRES ---
      const accY = doc.y;
      doc.rect(50, accY, 495, 105)
         .fillAndStroke('#fef3c7', '#f59e0b');

      doc.fillColor('#92400e')
         .fontSize(11)
         .font('Helvetica-Bold')
         .text('🔑 ACCÈS TEMPORAIRES SÉCURISÉS (PORTAIL DE DÉLIBÉRATION)', 65, accY + 12)
         .fillColor('#0f172a')
         .fontSize(10)
         .font('Helvetica-Bold')
         .text(`• Identifiant Temporaire : `, 65, accY + 36)
         .font('Helvetica')
         .text(`${juryData.identifiant_temporaire}`, 210, accY + 36)
         .font('Helvetica-Bold')
         .text(`• Mot de Passe Temporaire : `, 65, accY + 54)
         .font('Helvetica')
         .text(`${juryData.mot_de_passe_temporaire}`, 210, accY + 54)
         .font('Helvetica-Bold')
         .text(`• Date Limite d'Expiration : `, 65, accY + 72)
         .fillColor('#b91c1c')
         .text(`${juryData.date_expiration_str}`, 210, accY + 72);

      doc.y = accY + 120;

      // --- NOTE DE SÉCURITÉ ---
      doc.fillColor('#475569')
         .fontSize(8.5)
         .font('Helvetica-Oblique')
         .text('Remarque Importante :', 50, doc.y)
         .text('Ces identifiants temporaires vous permettent d\'accéder exclusivement à l\'Espace de Délibération du Jury. À la date d\'expiration indiquée ci-dessus, les accès et votre badge officiel s\'auto-verrouilleront automatiquement. Votre compte enseignant habituel au sein de votre établissement reste 100% intact.', { width: 495 });

      doc.moveDown(2);

      // --- SIGNATURE ET TAMPON OFFICIEL ---
      const sigY = doc.y + 10;
      doc.fillColor('#0f172a')
         .fontSize(9)
         .font('Helvetica-Bold')
         .text('Fait à Dakar, le ' + new Date().toLocaleDateString('fr-FR'), 330, sigY)
         .text('Pour le Directeur de l\'Office du Baccalauréat,', 330, sigY + 15)
         .font('Helvetica')
         .text('Le Chef de la Division des Examens', 330, sigY + 28);

      doc.end();

      writeStream.on('finish', () => {
        try {
          fs.copyFileSync(filePath, publicFilePath);
        } catch (e) {
          console.error('Erreur copie convocation pdf:', e);
        }
        resolve({
          fileName,
          fileUrl: `/uploads/messages/${fileName}`
        });
      });

      writeStream.on('error', (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generateConvocationPDF };
