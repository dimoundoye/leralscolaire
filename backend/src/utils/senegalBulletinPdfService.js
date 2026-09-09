const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const db = require('../config/db');
const path = require('path');
const fs = require('fs');

/**
 * Service de génération des bulletins officiels selon les normes sénégalaises (1er & 2ème Semestre)
 * Mise en page optimisée, police agrandie, et affichage des informations publiques de l'établissement.
 */

async function getBulletinData(eleveId, semesterNum) {
  const sem = parseInt(semesterNum) || 1;

  // 1. Récupérer l'élève, son établissement et sa classe actuelle
  const infoRes = await db.query(`
    SELECT e.*, 
           et.nom as etablissement_nom, et.ville, et.region, et.signature_url, et.cachet_url,
           et.code_etablissement, et.nom_directeur,
           c.nom as classe_nom, c.id as classe_id, c.annee_scolaire, c.niveau
    FROM eleves e
    JOIN etablissements et ON e.etablissement_id = et.id
    LEFT JOIN LATERAL (
      SELECT c.nom, c.id, c.annee_scolaire, c.niveau
      FROM inscription_classes ic
      JOIN classes c ON ic.classe_id = c.id
      WHERE ic.eleve_id = e.id
      ORDER BY ic.date_inscription DESC
      LIMIT 1
    ) c ON true
    WHERE e.id = $1
  `, [eleveId]);

  if (infoRes.rows.length === 0) return null;
  const eleve = infoRes.rows[0];

  const classeId = eleve.classe_id;
  const anneeScolaire = eleve.annee_scolaire || '2025-2026';

  // 2. Effectif de la classe
  let effectif = 0;
  if (classeId) {
    const effRes = await db.query(`SELECT COUNT(DISTINCT eleve_id) as total FROM inscription_classes WHERE classe_id = $1`, [classeId]);
    effectif = parseInt(effRes.rows[0].total) || 0;
  }

  // 3. Récupérer la liste des matières de la classe avec coefficients
  let matieresDef = [];
  if (classeId) {
    const matRes = await db.query(`
      SELECT m.id as matiere_id, m.nom as matiere_nom, m.code_matiere,
             COALESCE(cm.coefficient, 1) as coefficient
      FROM classe_matieres cm
      JOIN matieres m ON cm.matiere_id = m.id
      WHERE cm.classe_id = $1
      ORDER BY m.nom
    `, [classeId]);
    matieresDef = matRes.rows;
  }

  // Si aucune matière associée dans classe_matieres, chercher les matières avec notes
  if (matieresDef.length === 0) {
    const fallbackMatRes = await db.query(`
      SELECT DISTINCT m.id as matiere_id, m.nom as matiere_nom, m.code_matiere,
             COALESCE(n.coefficient, 1) as coefficient
      FROM notes n
      JOIN matieres m ON n.matiere_id = m.id
      WHERE n.eleve_id = $1
      ORDER BY m.nom
    `, [eleveId]);
    matieresDef = fallbackMatRes.rows;
  }

  // 4. Récupérer toutes les notes pour le semestre actuel pour cet élève
  const notesRes = await db.query(`
    SELECT n.*, m.code_matiere, m.nom as matiere_nom
    FROM notes n
    JOIN matieres m ON n.matiere_id = m.id
    WHERE n.eleve_id = $1 AND n.semestre = $2
  `, [eleveId, sem]);

  // 5. Récupérer toutes les notes de TOUS les élèves de la classe pour calculer les rangs par matière & rang général
  let allClassNotes = [];
  if (classeId) {
    const classNotesRes = await db.query(`
      SELECT n.eleve_id, n.matiere_id, n.valeur, n.type_note, n.semestre
      FROM notes n
      JOIN inscription_classes ic ON n.eleve_id = ic.eleve_id
      WHERE ic.classe_id = $1 AND n.semestre = $2 AND n.valeur IS NOT NULL
    `, [classeId, sem]);
    allClassNotes = classNotesRes.rows;
  }

  // Calcul des moyennes par matière pour tous les élèves de la classe
  const classStudentSubjectAvg = {};
  allClassNotes.forEach(n => {
    if (!classStudentSubjectAvg[n.eleve_id]) classStudentSubjectAvg[n.eleve_id] = {};
    if (!classStudentSubjectAvg[n.eleve_id][n.matiere_id]) {
      classStudentSubjectAvg[n.eleve_id][n.matiere_id] = { devoirs: [], comps: [] };
    }
    const val = parseFloat(n.valeur);
    if (n.type_note === 'DEVOIR') {
      classStudentSubjectAvg[n.eleve_id][n.matiere_id].devoirs.push(val);
    } else {
      classStudentSubjectAvg[n.eleve_id][n.matiere_id].comps.push(val);
    }
  });

  const classSubjectRankings = {};
  Object.keys(classStudentSubjectAvg).forEach(eId => {
    Object.keys(classStudentSubjectAvg[eId]).forEach(mId => {
      const data = classStudentSubjectAvg[eId][mId];
      const devAvg = data.devoirs.length > 0 ? (data.devoirs.reduce((a,b)=>a+b,0)/data.devoirs.length) : null;
      const compVal = data.comps.length > 0 ? data.comps[0] : null;
      let matAvg = null;
      if (devAvg !== null && compVal !== null) matAvg = (devAvg + compVal) / 2;
      else if (compVal !== null) matAvg = compVal;
      else if (devAvg !== null) matAvg = devAvg;

      if (matAvg !== null) {
        if (!classSubjectRankings[mId]) classSubjectRankings[mId] = [];
        classSubjectRankings[mId].push({ eleve_id: eId, avg: matAvg });
      }
    });
  });

  Object.keys(classSubjectRankings).forEach(mId => {
    classSubjectRankings[mId].sort((a,b) => b.avg - a.avg);
  });

  // 6. Construire les données par matière pour le bulletin de l'élève
  const studentNotesMap = {};
  notesRes.rows.forEach(n => {
    if (!studentNotesMap[n.matiere_id]) {
      studentNotesMap[n.matiere_id] = { devoirs: [], comps: [], appreciation: '' };
    }
    if (n.valeur !== null) {
      const val = parseFloat(n.valeur);
      if (n.type_note === 'DEVOIR') {
        studentNotesMap[n.matiere_id].devoirs.push(val);
      } else {
        studentNotesMap[n.matiere_id].comps.push(val);
      }
    }
    if (n.appreciation) studentNotesMap[n.matiere_id].appreciation = n.appreciation;
  });

  const matieresData = [];
  let totalPoints = 0;
  let totalCoeff = 0;

  matieresDef.forEach(m => {
    const sData = studentNotesMap[m.matiere_id] || { devoirs: [], comps: [], appreciation: '' };
    const devAvg = sData.devoirs.length > 0 ? (sData.devoirs.reduce((a,b)=>a+b,0)/sData.devoirs.length) : null;
    const compVal = sData.comps.length > 0 ? sData.comps[sData.comps.length - 1] : null;

    let moyenneMatiere = null;
    if (devAvg !== null && compVal !== null) {
      moyenneMatiere = (devAvg + compVal) / 2;
    } else if (compVal !== null) {
      moyenneMatiere = compVal;
    } else if (devAvg !== null) {
      moyenneMatiere = devAvg;
    }

    const coeff = parseFloat(m.coefficient) || 1;
    let moyCoeff = null;
    if (moyenneMatiere !== null) {
      moyCoeff = moyenneMatiere * coeff;
      totalPoints += moyCoeff;
      totalCoeff += coeff;
    }

    let rangMatiere = '-';
    if (moyenneMatiere !== null && classSubjectRankings[m.matiere_id]) {
      const list = classSubjectRankings[m.matiere_id];
      const idx = list.findIndex(item => item.eleve_id === eleveId);
      if (idx !== -1) {
        rangMatiere = (idx + 1).toString();
      }
    }

    let appText = sData.appreciation;
    if (!appText && moyenneMatiere !== null) {
      if (moyenneMatiere < 8) appText = 'Insuffisant';
      else if (moyenneMatiere < 10) appText = 'Insuffisant';
      else if (moyenneMatiere < 12) appText = 'Passable';
      else if (moyenneMatiere < 14) appText = 'Assez Bien';
      else if (moyenneMatiere < 16) appText = 'Bien';
      else appText = 'Très Bien';
    }

    const thText = (moyenneMatiere !== null && moyenneMatiere >= 12) ? 'TH' : '';

    matieresData.push({
      matiere_nom: m.matiere_nom,
      devoir: devAvg,
      comp: compVal,
      moyenne: moyenneMatiere,
      coefficient: coeff,
      moy_x: moyCoeff,
      th: thText,
      rang: rangMatiere,
      appreciation: appText || '-'
    });
  });

  const moyenneGenerale = totalCoeff > 0 ? (totalPoints / totalCoeff) : null;

  // 7. Calcul du Rang Général de la classe pour le semestre
  let rangGeneral = '-';
  if (classeId && moyenneGenerale !== null) {
    const studentTotals = {};
    Object.keys(classStudentSubjectAvg).forEach(eId => {
      let ePoints = 0;
      let eCoeff = 0;
      matieresDef.forEach(m => {
        const d = classStudentSubjectAvg[eId][m.matiere_id];
        if (d) {
          const dev = d.devoirs.length > 0 ? (d.devoirs.reduce((a,b)=>a+b,0)/d.devoirs.length) : null;
          const cmp = d.comps.length > 0 ? d.comps[0] : null;
          let avg = null;
          if (dev !== null && cmp !== null) avg = (dev + cmp) / 2;
          else if (cmp !== null) avg = cmp;
          else if (dev !== null) avg = dev;

          if (avg !== null) {
            const c = parseFloat(m.coefficient) || 1;
            ePoints += avg * c;
            eCoeff += c;
          }
        }
      });
      if (eCoeff > 0) {
        studentTotals[eId] = ePoints / eCoeff;
      }
    });

    const sortedRank = Object.keys(studentTotals)
      .map(id => ({ id, moy: studentTotals[id] }))
      .sort((a,b) => b.moy - a.moy);

    const rIdx = sortedRank.findIndex(item => item.id === eleveId);
    if (rIdx !== -1) {
      rangGeneral = (rIdx + 1).toString();
    }
  }

  // 8. Récupérer retards et absences
  const absRes = await db.query(`
    SELECT type_presence, COUNT(*) as count, SUM(COALESCE(duree_retard, 0)) as min_retard
    FROM absences
    WHERE eleve_id = $1
    GROUP BY type_presence
  `, [eleveId]);

  let countRetards = 0;
  let countAbsences = 0;
  absRes.rows.forEach(r => {
    if (r.type_presence === 'RETARD') countRetards += parseInt(r.count);
    else if (r.type_presence === 'ABSENT' || r.type_presence === 'ABSENCE') countAbsences += parseInt(r.count);
  });

  // 9. Récupérer les décisions du jury / conseils enregistrées dans bulletins
  let bulletinSaved = null;
  if (classeId) {
    const bRes = await db.query(`
      SELECT * FROM bulletins
      WHERE eleve_id = $1 AND classe_id = $2
    `, [eleveId, classeId]);
    if (bRes.rows.length > 0) {
      bulletinSaved = bRes.rows[0];
    }
  }

  // 10. Données du 2ème semestre
  let sem1Data = null;
  let moyenneAnnuelle = null;
  let rangAnnuel = '-';

  if (sem === 2) {
    const s1Res = await getBulletinData(eleveId, 1);
    if (s1Res && s1Res.moyenneGenerale !== null) {
      sem1Data = s1Res;
      if (moyenneGenerale !== null) {
        moyenneAnnuelle = (s1Res.moyenneGenerale + moyenneGenerale) / 2;
      } else {
        moyenneAnnuelle = s1Res.moyenneGenerale;
      }
    } else {
      moyenneAnnuelle = moyenneGenerale;
    }

    if (bulletinSaved && bulletinSaved.rang_annuel) {
      rangAnnuel = bulletinSaved.rang_annuel.toString();
    } else {
      rangAnnuel = rangGeneral;
    }
  }

  return {
    eleve,
    semestre: sem,
    anneeScolaire,
    effectif,
    matieresData,
    totalCoeff,
    totalPoints,
    moyenneGenerale,
    rangGeneral,
    countRetards,
    countAbsences,
    bulletinSaved,
    sem1Data,
    moyenneAnnuelle,
    rangAnnuel
  };
}

/**
 * Dessine le bulletin au format PDF avec une police agrandie et les infos publiques de l'établissement
 */
async function drawSenegalBulletin(doc, data) {
  const {
    eleve,
    semestre,
    anneeScolaire,
    effectif,
    matieresData,
    totalCoeff,
    totalPoints,
    moyenneGenerale,
    rangGeneral,
    countRetards,
    countAbsences,
    bulletinSaved,
    sem1Data,
    moyenneAnnuelle,
    rangAnnuel
  } = data;

  const startX = 35;
  const pageWidth = 525; // 595.28 - 70

  // --- EN-TÊTE ---
  // Ligne d'autorisation officielle & contact en haut
  const autNumStr = eleve.code_etablissement ? `Code Établissement : ${eleve.code_etablissement}` : 'Aut N°0121/IA/Dakar du 12/09/2010 Touba Ouakam-OUAKAM';
  const autText = `République du Sénégal - Ministère de l'Éducation Nationale | ${autNumStr}`;
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#333333');
  doc.text(autText, startX, 22, { align: 'center', width: pageWidth });

  const topY = 36;

  // Gauche : IA, IEF, Établissement & Informations Publiques
  const regionIA = (eleve.region || 'DAKAR').toUpperCase();
  const villeIEF = (eleve.ville || 'ALMADIES').toUpperCase();
  
  doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#000000');
  doc.text(`IA ${regionIA}`, startX, topY);
  doc.text(`IEF ${villeIEF}`, startX, topY + 12);
  
  doc.font('Helvetica-Bold').fontSize(11).fillColor('#0f172a');
  doc.text(eleve.etablissement_nom || 'CPS MAME NDJIRA', startX, topY + 25);
  
  // Informations publiques supplémentaires de l'établissement
  doc.font('Helvetica').fontSize(8.5).fillColor('#475569');
  let pubInfoText = `Localisation : ${eleve.ville || ''} (${eleve.region || ''})`;
  if (eleve.nom_directeur) {
    pubInfoText += ` | Dir. : ${eleve.nom_directeur}`;
  }
  doc.text(pubInfoText, startX, topY + 39);

  // Droite : Année scolaire & Intitulé du Semestre
  doc.font('Helvetica-Bold').fontSize(10).fillColor('#000000').text(`Année Scolaire : ${anneeScolaire}`, startX + 280, topY, { align: 'right', width: 245 });
  doc.font('Helvetica-Bold').fontSize(13).fillColor('#1e3a8a');
  const semTitle = semestre === 1 ? '1er SEMESTRE' : 'Bulletin du 2ème Semestre';
  doc.text(semTitle, startX + 250, topY + 16, { align: 'right', width: 275 });

  // Logo au centre
  const logoPath = path.join(__dirname, '../assets/senegal_education_logo.png');
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, startX + 235, topY - 2, { width: 48 });
  }

  // Lignes de séparation sous en-tête
  const headerLineY = topY + 54;
  doc.moveTo(startX, headerLineY).lineTo(startX + pageWidth, headerLineY).lineWidth(1.5).stroke('#0f172a');
  doc.moveTo(startX, headerLineY + 2).lineTo(startX + pageWidth, headerLineY + 2).lineWidth(0.5).stroke('#0f172a');

  // --- BANDEAU TITRE ---
  const titleY = headerLineY + 6;
  doc.rect(startX, titleY, pageWidth, 20).fillAndStroke('#f8fafc', '#000000');
  doc.font('Helvetica-Bold').fontSize(13).fillColor('#0f172a').text('BULLETIN DE NOTES', startX, titleY + 4, { align: 'center', width: pageWidth });

  // --- BLOC INFORMATIONS ÉLÈVE ---
  const infoY = titleY + 24;
  doc.rect(startX, infoY, pageWidth, 46).stroke('#000000');

  doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#000000');
  // Ligne 1
  doc.text('Prénoms', startX + 6, infoY + 6);
  doc.font('Helvetica').text(`: ${eleve.prenom || ''}`, startX + 55, infoY + 6);

  doc.font('Helvetica-Bold').text('Nom', startX + 310, infoY + 6);
  doc.font('Helvetica').text(`: ${eleve.nom || ''}`, startX + 360, infoY + 6);

  // Ligne 2
  const dobStr = eleve.date_naissance ? new Date(eleve.date_naissance).toLocaleDateString('fr-SN') : '-';
  doc.font('Helvetica-Bold').text('Né (e) le', startX + 6, infoY + 19);
  doc.font('Helvetica').text(`: ${dobStr}`, startX + 55, infoY + 19);

  doc.font('Helvetica-Bold').text('à', startX + 145, infoY + 19);
  doc.font('Helvetica').text(`: ${eleve.lieu_naissance || 'Dakar'}`, startX + 160, infoY + 19);

  doc.font('Helvetica-Bold').text('Classe', startX + 310, infoY + 19);
  doc.font('Helvetica').text(`: ${eleve.classe_nom || '1ère S2'}`, startX + 360, infoY + 19);

  // Ligne 3
  doc.font('Helvetica-Bold').text('Matricule', startX + 6, infoY + 32);
  doc.font('Helvetica').text(`: ${eleve.identifiant_national || eleve.id.toString().slice(0,8)}`, startX + 60, infoY + 32);

  doc.font('Helvetica-Bold').text('Nbre d\'élèves', startX + 175, infoY + 32);
  doc.font('Helvetica').text(`: ${effectif || 22}`, startX + 245, infoY + 32);

  doc.font('Helvetica-Bold').text('Classe Redoublée', startX + 310, infoY + 32);
  doc.font('Helvetica').text(`: ${eleve.classe_redoublee || '0'}`, startX + 415, infoY + 32);

  // --- TABLEAU PRINCIPAL DES NOTES ---
  const tableY = infoY + 52;
  const colW = {
    disc: 135, // Elargi à 135 pt pour éviter la coupure de "Sciences de la Vie et de la Terre"
    dev: 38,
    comp: 38,
    moy20: 44,
    coef: 28,
    moyX: 44,
    th: 26,
    rang: 32,
    appr: 140
  };

  const xDisc = startX;
  const xDev = xDisc + colW.disc;
  const xComp = xDev + colW.dev;
  const xMoy20 = xComp + colW.comp;
  const xCoef = xMoy20 + colW.moy20;
  const xMoyX = xCoef + colW.coef;
  const xTH = xMoyX + colW.moyX;
  const xRang = xTH + colW.th;
  const xAppr = xRang + colW.rang;

  const headerH = 18;
  doc.rect(startX, tableY, pageWidth, headerH).fillAndStroke('#f1f5f9', '#000000');

  // Textes en-tête tableau
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#000000');
  doc.text('DISCIPLINES', xDisc + 4, tableY + 5);
  doc.text('Devoir', xDev, tableY + 5, { width: colW.dev, align: 'center' });
  doc.text('Comp', xComp, tableY + 5, { width: colW.comp, align: 'center' });
  doc.text('Moy/20', xMoy20, tableY + 5, { width: colW.moy20, align: 'center' });
  doc.text('Coef', xCoef, tableY + 5, { width: colW.coef, align: 'center' });
  doc.text('Moy x', xMoyX, tableY + 5, { width: colW.moyX, align: 'center' });
  doc.text('T.H', xTH, tableY + 5, { width: colW.th, align: 'center' });
  doc.text('Rang', xRang, tableY + 5, { width: colW.rang, align: 'center' });
  doc.text('Appréciations', xAppr + 4, tableY + 5);

  [xDev, xComp, xMoy20, xCoef, xMoyX, xTH, xRang, xAppr].forEach(x => {
    doc.moveTo(x, tableY).lineTo(x, tableY + headerH).stroke('#000000');
  });

  // Lignes de matières avec police agrandie (9.5pt) et hauteur 20pt
  let rowY = tableY + headerH;
  const rowH = 20;

  matieresData.forEach((row) => {
    doc.rect(startX, rowY, pageWidth, rowH).stroke('#000000');
    [xDev, xComp, xMoy20, xCoef, xMoyX, xTH, xRang, xAppr].forEach(x => {
      doc.moveTo(x, rowY).lineTo(x, rowY + rowH).stroke('#000000');
    });

    doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#0f172a');
    doc.text(row.matiere_nom, xDisc + 4, rowY + 5, { width: colW.disc - 6, height: 12 });

    doc.font('Helvetica').fontSize(9.5).fillColor('#000000');
    doc.text(row.devoir !== null ? row.devoir.toFixed(row.devoir % 1 === 0 ? 0 : 2).replace('.',',') : '-', xDev, rowY + 5, { width: colW.dev, align: 'center' });
    doc.text(row.comp !== null ? row.comp.toFixed(row.comp % 1 === 0 ? 0 : 2).replace('.',',') : '-', xComp, rowY + 5, { width: colW.comp, align: 'center' });
    doc.text(row.moyenne !== null ? row.moyenne.toFixed(row.moyenne % 1 === 0 ? 0 : 3).replace('.',',') : '-', xMoy20, rowY + 5, { width: colW.moy20, align: 'center' });
    doc.text(row.coefficient.toString(), xCoef, rowY + 5, { width: colW.coef, align: 'center' });
    doc.text(row.moy_x !== null ? row.moy_x.toFixed(2).replace('.',',') : '-', xMoyX, rowY + 5, { width: colW.moyX, align: 'center' });
    doc.text(row.th || '', xTH, rowY + 5, { width: colW.th, align: 'center' });
    doc.text(row.rang || '-', xRang, rowY + 5, { width: colW.rang, align: 'center' });
    
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#1e293b');
    doc.text(row.appreciation || '-', xAppr + 6, rowY + 5, { width: colW.appr - 8 });

    rowY += rowH;
  });

  // --- LIGNE DE TOTAL ---
  doc.rect(startX, rowY, pageWidth, rowH).fillAndStroke('#f8fafc', '#000000');
  [xDev, xComp, xMoy20, xCoef, xMoyX, xTH, xRang, xAppr].forEach(x => {
    doc.moveTo(x, rowY).lineTo(x, rowY + rowH).stroke('#000000');
  });

  doc.font('Helvetica-Bold').fontSize(10).fillColor('#000000').text('TOTAL', xDisc + 4, rowY + 5);
  doc.font('Helvetica-Bold').fontSize(10).text(totalCoeff.toString(), xCoef, rowY + 5, { width: colW.coef, align: 'center' });
  doc.font('Helvetica-Bold').fontSize(10).text(totalPoints > 0 ? totalPoints.toFixed(2).replace('.',',') : '-', xMoyX, rowY + 5, { width: colW.moyX, align: 'center' });

  if (semestre === 2) {
    doc.font('Helvetica-Bold').fontSize(9).text(`Absences`, xTH, rowY + 5);
    doc.font('Helvetica').fontSize(9).text(countAbsences.toString(), xAppr + 20, rowY + 5);
  }

  rowY += rowH;

  // --- LIGNE MOYENNE GÉNÉRALE, RANG, RETARDS & ABSENCES ---
  const moyRowH = 22;
  doc.rect(startX, rowY, pageWidth, moyRowH).stroke('#000000');

  const moyStr = moyenneGenerale !== null ? moyenneGenerale.toFixed(2).replace('.',',') : '--';
  doc.font('Helvetica-Bold').fontSize(10.5).fillColor('#0f172a').text(`Moyenne`, startX + 6, rowY + 5);
  doc.font('Helvetica-Bold').fontSize(12).fillColor('#1e3a8a').text(`${moyStr} /20`, startX + 60, rowY + 4);

  // Rang
  doc.moveTo(startX + 135, rowY).lineTo(startX + 135, rowY + moyRowH).stroke('#000000');
  doc.font('Helvetica-Bold').fontSize(10.5).fillColor('#000000').text(`Rang`, startX + 142, rowY + 5);
  doc.font('Helvetica-Bold').fontSize(11).text(`${rangGeneral}`, startX + 182, rowY + 4);

  // Retards
  doc.moveTo(startX + 220, rowY).lineTo(startX + 220, rowY + moyRowH).stroke('#000000');
  doc.font('Helvetica-Bold').fontSize(10.5).text(`Retards`, startX + 228, rowY + 5);
  doc.font('Helvetica').fontSize(10.5).text(`${countRetards}`, startX + 280, rowY + 5);

  // Absences
  doc.moveTo(startX + 310, rowY).lineTo(startX + 310, rowY + moyRowH).stroke('#000000');
  doc.font('Helvetica-Bold').fontSize(10.5).text(semestre === 2 ? `Abs. Tot` : `Absences`, startX + 318, rowY + 5);
  doc.font('Helvetica').fontSize(10.5).text(`${countAbsences}`, startX + 380, rowY + 5);

  rowY += moyRowH;

  // Si Semestre 2: Ligne spéciale des Mentions
  if (semestre === 2) {
    doc.rect(startX, rowY, pageWidth, 18).stroke('#000000');
    doc.font('Helvetica-Bold').fontSize(8.5);
    doc.text('Blâme', startX + 12, rowY + 5);
    doc.text('Avertissement', startX + 65, rowY + 5);
    doc.text('Tableau d\'honneur', startX + 152, rowY + 5);
    doc.text('Encouragement', startX + 255, rowY + 5);
    doc.text('Félicitations', startX + 365, rowY + 5);
    rowY += 18;
  }

  rowY += 12;

  // --- GRILLES D'APPRÉCIATION GLOBALE & MENTIONS HONORIFIQUES ---
  const gridW = 245;
  const gridH = 85;

  // Case à cocher agrandie
  const drawCheckbox = (x, y, isChecked) => {
    doc.rect(x, y, 14, 13).stroke('#000000');
    if (isChecked) {
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#000000').text('X', x + 3, y + 1);
    }
  };

  // Grille Gauche : Appréciation Globale / Travail
  doc.rect(startX, rowY, gridW, gridH).stroke('#000000');
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#0f172a');

  const moyVal = moyenneGenerale || 0;
  const isSatisfaisant = moyVal >= 14;
  const isPeutMieuxFaire = moyVal >= 10 && moyVal < 14;
  const isInsuffisant = moyVal >= 8 && moyVal < 10;
  const isRisqueRedoubler = moyVal >= 6 && moyVal < 8;
  const isRisqueExclusion = moyVal > 0 && moyVal < 6;

  doc.text('Satisfaisant doit continuer', startX + 8, rowY + 7);
  drawCheckbox(startX + 195, rowY + 5, isSatisfaisant);

  doc.text('Peut Mieux Faire', startX + 8, rowY + 23);
  drawCheckbox(startX + 195, rowY + 21, isPeutMieuxFaire);

  doc.text('Insuffisant', startX + 8, rowY + 39);
  drawCheckbox(startX + 195, rowY + 37, isInsuffisant);

  doc.text('Risque de Redoubler', startX + 8, rowY + 55);
  drawCheckbox(startX + 195, rowY + 53, isRisqueRedoubler);

  doc.text('Risque l\'exclusion', startX + 8, rowY + 71);
  drawCheckbox(startX + 195, rowY + 69, isRisqueExclusion);

  // Grille Droite : Mentions Honorifiques / Conduite
  const rightGridX = startX + 280;
  doc.rect(rightGridX, rowY, gridW, gridH).stroke('#000000');

  const isFelicitation = moyVal >= 16;
  const isEncouragement = moyVal >= 14 && moyVal < 16;
  const isTableauHonneur = moyVal >= 12 && moyVal < 14;
  const isAvertissement = moyVal >= 8 && moyVal < 10;
  const isBlame = moyVal > 0 && moyVal < 8;

  doc.text('Félicitations', rightGridX + 8, rowY + 7);
  drawCheckbox(rightGridX + 195, rowY + 5, isFelicitation);

  doc.text('Encouragement', rightGridX + 8, rowY + 23);
  drawCheckbox(rightGridX + 195, rowY + 21, isEncouragement);

  doc.text('Tableau d\'honneur', rightGridX + 8, rowY + 39);
  drawCheckbox(rightGridX + 195, rowY + 37, isTableauHonneur);

  doc.text('Avertissement', rightGridX + 8, rowY + 55);
  drawCheckbox(rightGridX + 195, rowY + 53, isAvertissement);

  doc.text('Blâme', rightGridX + 8, rowY + 71);
  drawCheckbox(rightGridX + 195, rowY + 69, isBlame);

  rowY += gridH + 12;

  // --- SECTION SPÉCIFIQUE AU 2ÈME SEMESTRE ---
  if (semestre === 2) {
    const box2H = 65;

    // Bloc Gauche : Décision du Conseil
    doc.rect(startX, rowY, gridW, box2H).stroke('#000000');
    doc.font('Helvetica-Bold').fontSize(9.5).text('Décision du Conseil', startX + 50, rowY + 5);
    doc.moveTo(startX, rowY + 17).lineTo(startX + gridW, rowY + 17).stroke('#000000');

    const dec = bulletinSaved ? bulletinSaved.decision : (moyenneAnnuelle >= 10 ? 'PASSAGE' : 'REDOUBLEMENT');
    const isAdmis = dec === 'PASSAGE';
    const isRedouble = dec === 'REDOUBLEMENT';
    const isExclu = dec === 'EXCLUSION';

    doc.font('Helvetica-Bold').fontSize(9);
    doc.text('Admis(e) en classe supérieure', startX + 8, rowY + 22);
    drawCheckbox(startX + 195, rowY + 20, isAdmis);

    doc.text('Autorisé(e) à redoubler', startX + 8, rowY + 36);
    drawCheckbox(startX + 195, rowY + 34, isRedouble);

    doc.text('Exclusion', startX + 8, rowY + 50);
    drawCheckbox(startX + 195, rowY + 48, isExclu);

    // Bloc Droit : Récapitulatif Annuel
    doc.rect(rightGridX, rowY, gridW, box2H).stroke('#000000');

    const moyS1Str = sem1Data && sem1Data.moyenneGenerale ? sem1Data.moyenneGenerale.toFixed(2).replace('.',',') : '-';
    const moyS2Str = moyenneGenerale ? moyenneGenerale.toFixed(2).replace('.',',') : '-';
    const moyAnnStr = moyenneAnnuelle ? moyenneAnnuelle.toFixed(2).replace('.',',') : '-';

    doc.font('Helvetica-Bold').fontSize(9);
    doc.text('Moy. 1er sem..............', rightGridX + 10, rowY + 7);
    doc.font('Helvetica-Bold').text(moyS1Str, rightGridX + 165, rowY + 7, { align: 'right', width: 70 });

    doc.text('Moy. 2ème sem..........', rightGridX + 10, rowY + 21);
    doc.font('Helvetica-Bold').text(moyS2Str, rightGridX + 165, rowY + 21, { align: 'right', width: 70 });

    doc.text('Moyenne annuelle......', rightGridX + 10, rowY + 35);
    doc.font('Helvetica-Bold').text(moyAnnStr, rightGridX + 165, rowY + 35, { align: 'right', width: 70 });

    doc.text('Rang annuel................', rightGridX + 10, rowY + 49);
    doc.font('Helvetica-Bold').text(rangAnnuel, rightGridX + 165, rowY + 49, { align: 'right', width: 70 });

    rowY += box2H + 12;
  }

  // --- PIED DE PAGE : OBSERVATIONS & SIGNATURES ---
  const footerBoxH = 65;

  // Observations du Conseil
  doc.rect(startX, rowY, gridW, footerBoxH).stroke('#000000');
  doc.font('Helvetica-Bold').fontSize(9.5).text('Observations du conseil des professeurs', startX + 6, rowY + 5);

  const obsText = (bulletinSaved && bulletinSaved.observations_jury)
    ? bulletinSaved.observations_jury
    : (moyVal >= 10 ? 'Passable.\nPeut mieux faire.' : 'Insuffisant.\nDoit fournir plus d\'efforts.');

  doc.font('Times-Italic').fontSize(11.5).fillColor('#000080');
  doc.text(obsText, startX + 10, rowY + 21, { width: gridW - 20, height: 40 });

  // Le Chef d'Établissement
  doc.font('Helvetica-Bold').fontSize(10).fillColor('#000000');
  doc.text('Le Chef d\'Etablissement', rightGridX + 25, rowY + 5);

  // Cachet et Signature du Chef d'Établissement (Taille agrandie)
  const stampX = rightGridX + 10;
  const stampY = rowY + 10;

  if (eleve.cachet_url) {
    const cPath = path.join(__dirname, '../../', eleve.cachet_url);
    if (fs.existsSync(cPath)) {
      doc.image(cPath, stampX, stampY, { width: 165 });
    }
  }

  if (eleve.signature_url) {
    const sPath = path.join(__dirname, '../../', eleve.signature_url);
    if (fs.existsSync(sPath)) {
      doc.image(sPath, stampX + 10, stampY + 8, { width: 145 });
    }
  }

  // QR Code et note d'authenticité en bas de page
  const qrY = 765;
  const qrData = `LeralScolaire - Bulletin Officiel - ${eleve.nom} ${eleve.prenom} - ID: ${eleve.identifiant_national} - S${semestre} - Moyenne: ${moyenneGenerale ? moyenneGenerale.toFixed(2) : '--'}`;
  try {
    const qrCodeImage = await QRCode.toDataURL(qrData);
    doc.image(qrCodeImage, startX, qrY, { width: 50 });
    doc.font('Helvetica-Ob lique').fontSize(7.5).fillColor('#64748b');
    doc.text('Document officiel certifié et vérifié numériquement via la plateforme nationale LeralScolaire.', startX + 58, qrY + 18, { width: 400 });
  } catch (qrErr) {
    console.error('Erreur QR Code:', qrErr);
  }
}

/**
 * Génère un flux PDF complet pour un bulletin
 */
async function generateSenegalBulletinPdf(eleveId, semesterNum, res) {
  const data = await getBulletinData(eleveId, semesterNum);
  if (!data) {
    if (res) res.status(404).json({ message: 'Élève ou données introuvables.' });
    return null;
  }

  const doc = new PDFDocument({ size: 'A4', margin: 30 });
  const fileName = `bulletin_S${data.semestre}_${data.eleve.identifiant_national || eleveId}.pdf`;

  if (res) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    doc.pipe(res);
  }

  await drawSenegalBulletin(doc, data);
  doc.end();
  return doc;
}

module.exports = {
  getBulletinData,
  drawSenegalBulletin,
  generateSenegalBulletinPdf
};
