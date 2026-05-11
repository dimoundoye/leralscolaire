const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

// --- GÉNÉRATION BULLETIN PDF ---
router.get('/bulletin/:eleveId', auth, async (req, res) => {
  const { eleveId } = req.params;
  const { semestre } = req.query;

  try {
    // 1. Récupérer les infos de l'élève et établissement
    const infoRes = await db.query(`
      SELECT e.*, et.nom as etablissement_nom, et.signature_url, et.cachet_url, c.nom as classe_nom
      FROM eleves e
      JOIN etablissements et ON e.etablissement_id = et.id
      JOIN inscription_classes ic ON e.id = ic.eleve_id
      JOIN classes c ON ic.classe_id = c.id
      WHERE e.id = $1
    `, [eleveId]);

    if (infoRes.rows.length === 0) return res.status(404).json({ message: 'Élève non trouvé.' });
    const eleve = infoRes.rows[0];

    // 2. Récupérer les notes
    const notesRes = await db.query(`
      SELECT m.nom as matiere, n.valeur, cm.coefficient, n.appreciation
      FROM notes n
      JOIN matieres m ON n.matiere_id = m.id
      JOIN classe_matieres cm ON cm.matiere_id = m.id
      JOIN inscription_classes ic ON ic.eleve_id = n.eleve_id AND ic.classe_id = cm.classe_id
      WHERE n.eleve_id = $1 AND (n.semestre = $2 OR $2 IS NULL)
    `, [eleveId, semestre || 1]);

    // 3. Calculer la moyenne
    let totalPoints = 0;
    let totalCoeff = 0;
    notesRes.rows.forEach(n => {
      totalPoints += parseFloat(n.valeur) * n.coefficient;
      totalCoeff += n.coefficient;
    });
    const moyenne = totalCoeff > 0 ? (totalPoints / totalCoeff).toFixed(2) : 0;

    // 4. Générer le QR Code
    const qrData = `LeralScolaire - Bulletin Authentique - ${eleve.nom} ${eleve.prenom} - ID: ${eleve.identifiant_national} - Moyenne: ${moyenne}`;
    const qrCodeImage = await QRCode.toDataURL(qrData);

    // 5. Créer le PDF
    const doc = new PDFDocument({ margin: 50 });
    const fileName = `bulletin_${eleve.identifiant_national}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    doc.pipe(res);

    // En-tête
    doc.fontSize(20).text(eleve.etablissement_nom, { align: 'center', underline: true });
    doc.fontSize(14).text(`Bulletin de Notes - Semestre ${semestre || 1}`, { align: 'center' });
    doc.moveDown();

    // Infos Élève
    doc.fontSize(12).text(`Nom : ${eleve.nom}`);
    doc.text(`Prénom : ${eleve.prenom}`);
    doc.text(`Identifiant National : ${eleve.identifiant_national}`);
    doc.text(`Classe : ${eleve.classe_nom}`);
    doc.moveDown();

    // Tableau des notes
    const tableTop = 200;
    doc.fontSize(12).text('Matière', 50, tableTop);
    doc.text('Note', 250, tableTop);
    doc.text('Coeff', 350, tableTop);
    doc.text('Appréciation', 450, tableTop);
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    let y = tableTop + 30;
    notesRes.rows.forEach(n => {
      doc.text(n.matiere, 50, y);
      doc.text(n.valeur, 250, y);
      doc.text(n.coefficient.toString(), 350, y);
      doc.fontSize(10).text(n.appreciation || '-', 450, y, { width: 100 });
      y += 20;
    });

    doc.moveTo(50, y).lineTo(550, y).stroke();
    doc.fontSize(14).text(`MOYENNE GÉNÉRALE : ${moyenne} / 20`, 50, y + 20, { bold: true });

    // QR Code
    doc.image(qrCodeImage, 450, 50, { width: 80 });

    // Signature & Cachet (si dispo)
    if (eleve.signature_url) {
      // On suppose que c'est une image locale ou URL. Pour l'exemple, on met un placeholder
      doc.text('Signature Électronique:', 50, y + 60);
    }
    
    doc.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la génération du bulletin.' });
  }
});

// --- ATTESTATION D'INSCRIPTION ---
router.get('/attestation/:eleveId', auth, async (req, res) => {
  const { eleveId } = req.params;
  try {
    const infoRes = await db.query(`
      SELECT e.*, et.nom as etablissement_nom, et.ville as etablissement_ville, c.nom as classe_nom
      FROM eleves e
      JOIN etablissements et ON e.etablissement_id = et.id
      JOIN inscription_classes ic ON e.id = ic.eleve_id
      JOIN classes c ON ic.classe_id = c.id
      WHERE e.id = $1
    `, [eleveId]);

    if (infoRes.rows.length === 0) return res.status(404).json({ message: 'Élève non trouvé.' });
    const eleve = infoRes.rows[0];

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=attestation_${eleve.identifiant_national}.pdf`);
    doc.pipe(res);

    doc.fontSize(22).text('ATTESTATION D\'INSCRIPTION', { align: 'center' });
    doc.moveDown(2);

    doc.fontSize(14).text(`L'établissement ${eleve.etablissement_nom}, situé à ${eleve.etablissement_ville},`, { align: 'center' });
    doc.text(`certifie que l'élève :`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text(`${eleve.prenom} ${eleve.nom}`, { align: 'center', bold: true });
    doc.fontSize(14).text(`né(e) le ${new Date(eleve.date_naissance).toLocaleDateString()}`, { align: 'center' });
    doc.text(`Identifiant National : ${eleve.identifiant_national}`, { align: 'center' });
    doc.moveDown();
    doc.text(`est régulièrement inscrit(e) en classe de : ${eleve.classe_nom}`, { align: 'center' });
    doc.text(`pour l'année scolaire 2025-2026.`, { align: 'center' });

    doc.moveDown(4);
    doc.fontSize(12).text(`Fait à ${eleve.etablissement_ville}, le ${new Date().toLocaleDateString()}`, { align: 'right' });
    doc.text('Le Directeur', { align: 'right' });

    doc.end();
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;

