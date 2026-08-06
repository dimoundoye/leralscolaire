const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { drawSenegalBulletin } = require('../utils/senegalBulletinPdfService');

async function testPdf() {
  try {
    const sampleDataS1 = {
      eleve: {
        id: '123',
        nom: 'NDOYE',
        prenom: 'Mamadou',
        date_naissance: '2003-11-24',
        lieu_naissance: 'Dakar',
        identifiant_national: '202103216',
        classe_nom: '1ère S2',
        classe_redoublee: '0',
        etablissement_nom: 'CPS MAME NDJIRA',
        region: 'DAKAR',
        ville: 'ALMADIES'
      },
      semestre: 1,
      anneeScolaire: '2020-2021',
      effectif: 22,
      matieresData: [
        { matiere_nom: 'Français', devoir: 12.5, comp: 7, moyenne: 9.75, coefficient: 3, moy_x: 29.25, th: '', rang: '14', appreciation: 'Insuffisant' },
        { matiere_nom: 'Histo-Géo', devoir: 15, comp: 10, moyenne: 12.5, coefficient: 2, moy_x: 25, th: 'TH', rang: '2', appreciation: 'Assez Bien' },
        { matiere_nom: 'Anglais', devoir: 8.25, comp: 10, moyenne: 9.125, coefficient: 2, moy_x: 18.25, th: '', rang: '13', appreciation: 'Insuffisant' },
        { matiere_nom: 'Mathématiques', devoir: 7.75, comp: 9, moyenne: 8.375, coefficient: 5, moy_x: 41.875, th: '', rang: '10', appreciation: 'Insuffisant' },
        { matiere_nom: 'SVT', devoir: 12.25, comp: 12, moyenne: 12.125, coefficient: 6, moy_x: 72.75, th: 'TH', rang: '7', appreciation: 'Assez Bien' },
        { matiere_nom: 'PC', devoir: 14, comp: 7, moyenne: 10.5, coefficient: 6, moy_x: 63, th: '', rang: '5', appreciation: 'Passable' },
        { matiere_nom: 'Education Physique', devoir: 13, comp: 14, moyenne: 13.5, coefficient: 1, moy_x: 13.5, th: 'TH', rang: '17', appreciation: 'Assez Bien' }
      ],
      totalCoeff: 25,
      totalPoints: 263.63,
      moyenneGenerale: 10.55,
      rangGeneral: '8',
      countRetards: 1,
      countAbsences: 0,
      bulletinSaved: { observations_jury: 'Passable.\nPeut mieux faire.' }
    };

    const doc1 = new PDFDocument({ size: 'A4', margin: 30 });
    const out1Path = path.join(__dirname, 'test_bulletin_S1.pdf');
    doc1.pipe(fs.createWriteStream(out1Path));
    drawSenegalBulletin(doc1, sampleDataS1);
    doc1.end();
    console.log('✅ Generated S1 test PDF:', out1Path);

    const sampleDataS2 = {
      eleve: {
        id: '123',
        nom: 'NDOYE',
        prenom: 'Mamadou',
        date_naissance: '2003-11-24',
        lieu_naissance: 'Dakar',
        identifiant_national: '202103216',
        classe_nom: 'TS2',
        classe_redoublee: 'TS2',
        etablissement_nom: 'CPS MAME NDJIRA',
        region: 'DAKAR',
        ville: 'ALMADIES'
      },
      semestre: 2,
      anneeScolaire: '2022-2023',
      effectif: 23,
      matieresData: [
        { matiere_nom: 'Français', devoir: 10, comp: 8, moyenne: 9, coefficient: 3, moy_x: 27, th: '', rang: '16', appreciation: 'Insuffisant' },
        { matiere_nom: 'Histo-Géo', devoir: 11.75, comp: 9, moyenne: 10.375, coefficient: 2, moy_x: 20.75, th: '', rang: '11', appreciation: 'Passable' },
        { matiere_nom: 'Anglais', devoir: 9.5, comp: 7, moyenne: 8.25, coefficient: 2, moy_x: 16.5, th: '', rang: '19', appreciation: 'Insuffisant' },
        { matiere_nom: 'Mathématiques', devoir: 11.5, comp: 13, moyenne: 12.25, coefficient: 5, moy_x: 61.25, th: 'TH', rang: '6', appreciation: 'A. Bien' },
        { matiere_nom: 'S.V.T.', devoir: 5.25, comp: 4, moyenne: 4.625, coefficient: 6, moy_x: 27.75, th: '', rang: '19', appreciation: 'Tres Faible' },
        { matiere_nom: 'P.C.', devoir: 12, comp: 16, moyenne: 14, coefficient: 6, moy_x: 84, th: 'TH', rang: '2', appreciation: 'Bon Travail' },
        { matiere_nom: 'Philosophie', devoir: 11.5, comp: 7, moyenne: 9.25, coefficient: 2, moy_x: 18.5, th: '', rang: '16', appreciation: 'Insuffisant' },
        { matiere_nom: 'E.P.S.', devoir: 14, comp: 18, moyenne: 16, coefficient: 1, moy_x: 16, th: 'TH', rang: '7', appreciation: 'Tres Bon Travail' }
      ],
      totalCoeff: 27,
      totalPoints: 271.75,
      moyenneGenerale: 10.06,
      rangGeneral: '8',
      countRetards: 0,
      countAbsences: 2,
      bulletinSaved: { decision: 'REDOUBLEMENT', observations_jury: 'Passable.\nDoit faire ses preuves à l\'examen' },
      sem1Data: { moyenneGenerale: 10.93 },
      moyenneAnnuelle: 10.50,
      rangAnnuel: '5'
    };

    const doc2 = new PDFDocument({ size: 'A4', margin: 30 });
    const out2Path = path.join(__dirname, 'test_bulletin_S2.pdf');
    doc2.pipe(fs.createWriteStream(out2Path));
    drawSenegalBulletin(doc2, sampleDataS2);
    doc2.end();
    console.log('✅ Generated S2 test PDF:', out2Path);

  } catch (e) {
    console.error('Error testing PDF generation:', e);
  }
}

testPdf();
