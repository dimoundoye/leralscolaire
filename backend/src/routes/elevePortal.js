const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/authMiddleware');

// Security middleware to ensure role is ELEVE
const checkEleveRole = (req, res, next) => {
  if (req.user.role !== 'ELEVE') {
    return res.status(403).json({ message: 'Accès interdit. Rôle élève requis.' });
  }
  next();
};

// Helper to get student ID corresponding to user
async function getEleveId(userId) {
  const result = await db.query('SELECT id FROM eleves WHERE user_id = $1', [userId]);
  if (result.rows.length === 0) {
    throw new Error('Élève non trouvé pour cet utilisateur.');
  }
  return result.rows[0].id;
}

// --- 1. PROFIL DE L'ÉLÈVE ---
router.get('/profile', auth, checkEleveRole, async (req, res) => {
  try {
    const query = `
      SELECT e.*, u.email, et.nom as etablissement_nom, et.ville as etablissement_ville, et.region as etablissement_region,
             c.nom as classe_nom, c.id as classe_id, c.annee_scolaire as classe_annee_scolaire
      FROM eleves e
      JOIN users u ON e.user_id = u.id
      LEFT JOIN etablissements et ON e.etablissement_id = et.id
      LEFT JOIN LATERAL (
        SELECT cl.nom, cl.id, cl.annee_scolaire
        FROM inscription_classes ic
        JOIN classes cl ON ic.classe_id = cl.id
        WHERE ic.eleve_id = e.id
        ORDER BY ic.date_inscription DESC
        LIMIT 1
      ) c ON true
      WHERE e.user_id = $1
    `;
    const result = await db.query(query, [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Profil non trouvé.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération du profil.' });
  }
});

// --- 2. MODIFIER LES COORDONNÉES DU PROFIL ---
router.put('/profile', auth, checkEleveRole, async (req, res) => {
  const { telephone, coordonnees_parent } = req.body;
  try {
    const eleveId = await getEleveId(req.user.id);
    const result = await db.query(
      `UPDATE eleves 
       SET telephone = $1, coordonnees_parent = $2 
       WHERE id = $3 RETURNING *`,
      [telephone, coordonnees_parent, eleveId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la mise à jour des coordonnées.' });
  }
});

// --- 3. PORTEFOLIO NUMÉRIQUE ---
router.get('/portfolio', auth, checkEleveRole, async (req, res) => {
  try {
    const eleveId = await getEleveId(req.user.id);
    const result = await db.query(
      'SELECT * FROM portfolio_items WHERE eleve_id = $1 ORDER BY date_realisation DESC',
      [eleveId]
    );
    res.json(result.rows[0] ? result.rows : []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération du portfolio.' });
  }
});

router.post('/portfolio', auth, checkEleveRole, async (req, res) => {
  const { type, titre, description, annee_scolaire, date_realisation, media_url } = req.body;
  try {
    const eleveId = await getEleveId(req.user.id);
    const result = await db.query(
      `INSERT INTO portfolio_items (eleve_id, type, titre, description, annee_scolaire, date_realisation, media_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [eleveId, type, titre, description, annee_scolaire, date_realisation, media_url || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la création de l\'élément du portfolio.' });
  }
});

router.put('/portfolio/:id', auth, checkEleveRole, async (req, res) => {
  const { type, titre, description, annee_scolaire, date_realisation, media_url } = req.body;
  try {
    const eleveId = await getEleveId(req.user.id);
    // Vérifier l'appartenance
    const itemCheck = await db.query('SELECT eleve_id FROM portfolio_items WHERE id = $1', [req.params.id]);
    if (itemCheck.rows.length === 0) return res.status(404).json({ message: 'Élément introuvable.' });
    if (itemCheck.rows[0].eleve_id !== eleveId) return res.status(403).json({ message: 'Action non autorisée.' });

    const result = await db.query(
      `UPDATE portfolio_items 
       SET type = $1, titre = $2, description = $3, annee_scolaire = $4, date_realisation = $5, media_url = $6
       WHERE id = $7 RETURNING *`,
      [type, titre, description, annee_scolaire, date_realisation, media_url, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la modification de l\'élément.' });
  }
});

router.delete('/portfolio/:id', auth, checkEleveRole, async (req, res) => {
  try {
    const eleveId = await getEleveId(req.user.id);
    const itemCheck = await db.query('SELECT eleve_id FROM portfolio_items WHERE id = $1', [req.params.id]);
    if (itemCheck.rows.length === 0) return res.status(404).json({ message: 'Élément introuvable.' });
    if (itemCheck.rows[0].eleve_id !== eleveId) return res.status(403).json({ message: 'Action non autorisée.' });

    await db.query('DELETE FROM portfolio_items WHERE id = $1', [req.params.id]);
    res.json({ message: 'Élément du portfolio supprimé.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'élément.' });
  }
});

// --- 4. CV NUMÉRIQUE ÉVOLUTIF ---
router.get('/cv', auth, checkEleveRole, async (req, res) => {
  try {
    const eleveId = await getEleveId(req.user.id);
    
    // a. Profil
    const profileRes = await db.query(`
      SELECT e.*, et.nom as etablissement_nom
      FROM eleves e
      LEFT JOIN etablissements et ON e.etablissement_id = et.id
      WHERE e.id = $1
    `, [eleveId]);
    
    // b. Inscription history
    const parcoursRes = await db.query(`
      SELECT c.nom as classe_nom, c.niveau, c.annee_scolaire, et.nom as etablissement_nom
      FROM inscription_classes ic
      JOIN classes c ON ic.classe_id = c.id
      JOIN etablissements et ON c.etablissement_id = et.id
      WHERE ic.eleve_id = $1
      ORDER BY c.annee_scolaire DESC
    `, [eleveId]);
    
    // c. Realizations / Portfolio
    const portfolioRes = await db.query(
      'SELECT * FROM portfolio_items WHERE eleve_id = $1 ORDER BY date_realisation DESC',
      [eleveId]
    );

    // d. National Exams
    const examensRes = await db.query(
      'SELECT * FROM resultats_examens_nationaux WHERE eleve_id = $1 ORDER BY annee DESC',
      [eleveId]
    );

    res.json({
      profile: profileRes.rows[0],
      parcours: parcoursRes.rows,
      portfolio: portfolioRes.rows,
      examens: examensRes.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la génération du CV numérique.' });
  }
});

// --- 5. SUIVI ACADÉMIQUE (NOTES ET BULLETINS) ---
router.get('/notes', auth, checkEleveRole, async (req, res) => {
  try {
    const eleveId = await getEleveId(req.user.id);

    const notesRes = await db.query(`
      SELECT n.*, m.nom as matiere_nom, m.code_matiere, 
             COALESCE(cm.coefficient, n.coefficient, 1) as coefficient,
             COALESCE(c.nom, c_fb.nom) as classe_nom,
             COALESCE(c.annee_scolaire, c_fb.annee_scolaire, '2025-2026') as annee_scolaire
      FROM notes n
      JOIN matieres m ON n.matiere_id = m.id
      LEFT JOIN classes c ON n.classe_id = c.id
      LEFT JOIN inscription_classes ic ON (n.classe_id IS NULL AND ic.eleve_id = n.eleve_id)
      LEFT JOIN classes c_fb ON (n.classe_id IS NULL AND ic.classe_id = c_fb.id)
      LEFT JOIN classe_matieres cm ON cm.classe_id = COALESCE(n.classe_id, ic.classe_id) AND cm.matiere_id = n.matiere_id
      WHERE n.eleve_id = $1
      ORDER BY COALESCE(c.annee_scolaire, c_fb.annee_scolaire) DESC, n.semestre, n.trimestre, m.nom
    `, [eleveId]);

    const reportCard = {};

    notesRes.rows.forEach(row => {
      const annee = row.annee_scolaire || 'Année inconnue';
      const periode = `Semestre ${row.semestre || row.trimestre || 1}`;
      const codeMat = row.code_matiere;

      if (!reportCard[annee]) {
        reportCard[annee] = {
          classe: row.classe_nom || 'Non affectée',
          periodes: {}
        };
      }

      if (!reportCard[annee].periodes[periode]) {
        reportCard[annee].periodes[periode] = {
          matieres: {},
          moyenne_generale: 0,
          total_coefficients: 0
        };
      }

      const currentPeriod = reportCard[annee].periodes[periode];

      if (!currentPeriod.matieres[codeMat]) {
        currentPeriod.matieres[codeMat] = {
          nom: row.matiere_nom,
          coefficient: row.coefficient,
          notes: [],
          appreciation: ''
        };
      }

      const mat = currentPeriod.matieres[codeMat];
      mat.notes.push({
        id: row.id,
        valeur: parseFloat(row.valeur),
        type_note: row.type_note,
        date: row.date_saisie
      });

      if (row.appreciation) {
        mat.appreciation = row.appreciation;
      }
    });

    for (const annee of Object.keys(reportCard)) {
      for (const periode of Object.keys(reportCard[annee].periodes)) {
        const periodData = reportCard[annee].periodes[periode];
        let totalPoints = 0;
        let totalCoefficients = 0;

        for (const codeMat of Object.keys(periodData.matieres)) {
          const mat = periodData.matieres[codeMat];
          if (mat.notes.length > 0) {
            const sum = mat.notes.reduce((a, b) => a + b.valeur, 0);
            mat.moyenne = parseFloat((sum / mat.notes.length).toFixed(2));
            totalPoints += mat.moyenne * mat.coefficient;
            totalCoefficients += mat.coefficient;
          } else {
            mat.moyenne = null;
          }
        }

        periodData.total_coefficients = totalCoefficients;
        periodData.moyenne_generale = totalCoefficients > 0 
          ? parseFloat((totalPoints / totalCoefficients).toFixed(2)) 
          : 0;
      }
    }

    res.json(reportCard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération des notes.' });
  }
});

// --- 6. ÉVOLUTION DES NOTES POUR GRAPHIQUE ---
router.get('/notes-evolution', auth, checkEleveRole, async (req, res) => {
  try {
    const eleveId = await getEleveId(req.user.id);
    
    const notesRes = await db.query(`
      SELECT n.*, m.code_matiere, 
             COALESCE(cm.coefficient, n.coefficient, 1) as coefficient,
             COALESCE(c.annee_scolaire, c_fb.annee_scolaire, '2025-2026') as annee_scolaire
      FROM notes n
      JOIN matieres m ON n.matiere_id = m.id
      LEFT JOIN classes c ON n.classe_id = c.id
      LEFT JOIN inscription_classes ic ON (n.classe_id IS NULL AND ic.eleve_id = n.eleve_id)
      LEFT JOIN classes c_fb ON (n.classe_id IS NULL AND ic.classe_id = c_fb.id)
      LEFT JOIN classe_matieres cm ON cm.classe_id = COALESCE(n.classe_id, ic.classe_id) AND cm.matiere_id = n.matiere_id
      WHERE n.eleve_id = $1
      ORDER BY COALESCE(c.annee_scolaire, c_fb.annee_scolaire) ASC, n.semestre ASC
    `, [eleveId]);

    const reportCard = {};
    notesRes.rows.forEach(row => {
      const annee = row.annee_scolaire;
      const periode = 'S' + (row.semestre || row.trimestre || 1);
      const codeMat = row.code_matiere;

      if (!reportCard[annee]) reportCard[annee] = {};
      if (!reportCard[annee][periode]) reportCard[annee][periode] = {};
      if (!reportCard[annee][periode][codeMat]) {
        reportCard[annee][periode][codeMat] = { coefficient: row.coefficient, notes: [] };
      }
      reportCard[annee][periode][codeMat].notes.push(parseFloat(row.valeur));
    });

    const formattedData = [];
    Object.keys(reportCard).sort().forEach(annee => {
      Object.keys(reportCard[annee]).sort().forEach(periode => {
        const matieresObj = reportCard[annee][periode];
        let totalPts = 0, totalCoeff = 0;
        Object.keys(matieresObj).forEach(mCode => {
          const m = matieresObj[mCode];
          const avg = m.notes.reduce((a, b) => a + b, 0) / m.notes.length;
          totalPts += avg * m.coefficient;
          totalCoeff += m.coefficient;
        });
        const genAvg = totalCoeff > 0 ? parseFloat((totalPts / totalCoeff).toFixed(2)) : 0;
        formattedData.push({ periode: `${annee} - ${periode}`, moyenne: genAvg });
      });
    });

    res.json(formattedData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors du calcul de l\'évolution.' });
  }
});

// --- 7. EMPLOI DU TEMPS ET EXAMENS PLANIFIÉS ---
router.get('/schedule', auth, checkEleveRole, async (req, res) => {
  try {
    const eleveId = await getEleveId(req.user.id);

    // Timetable across all enrolled classes
    const timetableRes = await db.query(`
      SELECT edt.*, m.nom as matiere_nom, m.code_matiere, COALESCE(u.email, 'Enseignant') as professeur_email,
             c.nom as classe_nom, c.annee_scolaire
      FROM emplois_du_temps edt
      JOIN classes c ON edt.classe_id = c.id
      LEFT JOIN matieres m ON edt.matiere_id = m.id
      LEFT JOIN users u ON edt.professeur_id = u.id
      WHERE edt.classe_id IN (SELECT classe_id FROM inscription_classes WHERE eleve_id = $1)
      ORDER BY c.annee_scolaire DESC, 
        CASE edt.jour_semaine
          WHEN 'Lundi' THEN 1
          WHEN 'Mardi' THEN 2
          WHEN 'Mercredi' THEN 3
          WHEN 'Jeudi' THEN 4
          WHEN 'Vendredi' THEN 5
          WHEN 'Samedi' THEN 6
          ELSE 7
        END, edt.heure_debut
    `, [eleveId]);

    // Exams across all enrolled classes
    const examsRes = await db.query(`
      SELECT ep.*, m.nom as matiere_nom, m.code_matiere, c.nom as classe_nom, c.annee_scolaire
      FROM examens_planification ep
      JOIN classes c ON ep.classe_id = c.id
      LEFT JOIN matieres m ON ep.matiere_id = m.id
      WHERE ep.classe_id IN (SELECT classe_id FROM inscription_classes WHERE eleve_id = $1)
      ORDER BY ep.date_examen DESC
    `, [eleveId]);

    res.json({
      timetable: timetableRes.rows,
      exams: examsRes.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'emploi du temps.' });
  }
});

// --- 8. RÉSULTATS EXAMENS NATIONAUX (Portail Office du BAC) ---
router.get('/exam-results', auth, checkEleveRole, async (req, res) => {
  try {
    const eleveId = await getEleveId(req.user.id);

    // Récupérer les infos de l'élève pour la carte candidat
    const eleveRes = await db.query(`
      SELECT e.nom, e.prenom, e.identifiant_national, e.date_naissance, e.lieu_naissance,
             et.nom as etablissement_nom, et.region as etablissement_region
      FROM eleves e
      LEFT JOIN etablissements et ON e.etablissement_id = et.id
      WHERE e.id = $1
    `, [eleveId]);

    const eleve = eleveRes.rows[0] || null;

    // Récupérer TOUS les enregistrements de l'élève (publiés et convocations)
    const result = await db.query(`
      SELECT 
        id, type_examen, annee, serie, jury, centre_examen, 
        numero_table, statut_candidat, region,
        -- Résultats (visibles seulement si publie = true)
        CASE WHEN publie = true THEN moyenne ELSE NULL END as moyenne,
        CASE WHEN publie = true THEN mention ELSE NULL END as mention,
        CASE WHEN publie = true THEN statut_deliberation ELSE NULL END as statut_deliberation,
        CASE WHEN publie = true THEN statut_resultat ELSE NULL END as statut_resultat,
        CASE WHEN publie = true THEN details ELSE NULL END as details,
        CASE WHEN publie = true THEN details_epreuves ELSE NULL END as details_epreuves,
        CASE WHEN publie = true THEN appreciation_jury ELSE NULL END as appreciation_jury,
        CASE WHEN publie = true THEN date_deliberation ELSE NULL END as date_deliberation,
        publie,
        created_at
      FROM resultats_examens_nationaux
      WHERE eleve_id = $1
      ORDER BY annee DESC, created_at DESC
    `, [eleveId]);

    const resultats = [];
    for (const r of result.rows) {
      let notes = [];
      if (r.publie) {
        const notesRes = await db.query(
          'SELECT matiere_code, matiere_nom, note, coefficient, statut_presence FROM notes_candidats_bac WHERE candidat_id = $1 ORDER BY id ASC',
          [r.id]
        );
        notes = notesRes.rows;
      }
      resultats.push({ ...r, notes });
    }

    res.json({
      eleve,
      resultats
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération des examens nationaux.' });
  }
});

// --- 9. DOCUMENTS TÉLÉCHARGEABLES ---
router.get('/documents', auth, checkEleveRole, async (req, res) => {
  try {
    const eleveId = await getEleveId(req.user.id);
    
    const classesRes = await db.query(`
      SELECT ic.classe_id, c.nom as classe_nom, c.annee_scolaire
      FROM inscription_classes ic
      JOIN classes c ON ic.classe_id = c.id
      WHERE ic.eleve_id = $1
      ORDER BY ic.date_inscription DESC
    `, [eleveId]);

    const bulletinsList = [];
    for (const activeClass of classesRes.rows) {
      for (const sem of [1, 2]) {
        const pubRes = await db.query(`
          SELECT autorise FROM bulletins_autorises 
          WHERE classe_id = $1 AND semestre = $2 AND annee_scolaire = $3
        `, [activeClass.classe_id, sem, activeClass.annee_scolaire]);
        
        const dlRes = await db.query(`
          SELECT telecharge_at FROM bulletins_telechargements 
          WHERE eleve_id = $1 AND classe_id = $2 AND semestre = $3 AND annee_scolaire = $4
        `, [eleveId, activeClass.classe_id, sem, activeClass.annee_scolaire]);
        
        const autorise = pubRes.rows.length > 0 ? pubRes.rows[0].autorise : false;
        const telecharge = dlRes.rows.length > 0;
        const date_telechargement = dlRes.rows.length > 0 ? dlRes.rows[0].telecharge_at : null;

        bulletinsList.push({
          eleve_id: eleveId,
          semestre: sem,
          classe_id: activeClass.classe_id,
          classe_nom: activeClass.classe_nom,
          annee_scolaire: activeClass.annee_scolaire,
          autorise,
          telecharge,
          date_telechargement
        });
      }
    }

    res.json({
      bulletins: bulletinsList,
      attestationDisponible: true
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération des documents.' });
  }
});

// --- 10. NOTIFICATIONS ---
router.get('/notifications', auth, checkEleveRole, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 30',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération des notifications.' });
  }
});

router.post('/notifications/read', auth, checkEleveRole, async (req, res) => {
  try {
    await db.query(
      'UPDATE notifications SET lu = TRUE WHERE user_id = $1',
      [req.user.id]
    );
    res.json({ message: 'Notifications marquées comme lues.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur.' });
  }
});

// --- 11. MESSAGES REÇUS ---
router.get('/messages', auth, checkEleveRole, async (req, res) => {
  try {
    const eleveId = await getEleveId(req.user.id);
    
    const classeRes = await db.query(
      'SELECT classe_id FROM inscription_classes WHERE eleve_id = $1 ORDER BY date_inscription DESC LIMIT 1',
      [eleveId]
    );
    const classeId = classeRes.rows[0]?.classe_id;

    let query = `
      SELECT m.*, u.email as expediteur_nom, et.nom as etablissement_nom
      FROM messages m
      JOIN users u ON m.expediteur_id = u.id
      LEFT JOIN etablissements et ON et.admin_id = u.id
      WHERE (m.destinataire_type = 'ELEVE' AND m.destinataire_id = $1)
    `;
    const params = [req.user.id];

    if (classeId) {
      query += ` OR (m.destinataire_type = 'CLASSE' AND m.destinataire_id = $2)`;
      params.push(classeId);
    }

    query += ` ORDER BY m.date_envoi DESC`;

    const messages = await db.query(query, params);
    res.json(messages.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération des messages.' });
  }
});

// --- 12. ABSENCES POUR CALENDRIER DE TYPE GITHUB ---
router.get('/absences', auth, checkEleveRole, async (req, res) => {
  try {
    const eleveId = await getEleveId(req.user.id);
    const result = await db.query(
      `SELECT a.id, a.date_absence, a.justifiee, a.points_deduits, COALESCE(a.heures_absent, 1) as heures_absent,
              a.type_presence, a.duree_retard, a.motif, m.nom as matiere_nom
       FROM absences a
       LEFT JOIN matieres m ON a.matiere_id = m.id
       WHERE a.eleve_id = $1 
       ORDER BY a.date_absence DESC`,
      [eleveId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération des absences.' });
  }
});

// --- 13. DEMANDES D'ATTESTATION D'INSCRIPTION ---
router.post('/attestations/request', auth, checkEleveRole, async (req, res) => {
  const { motif_demande } = req.body;
  try {
    const eleveId = await getEleveId(req.user.id);
    
    const eleveRes = await db.query('SELECT etablissement_id FROM eleves WHERE id = $1', [eleveId]);
    if (eleveRes.rows.length === 0 || !eleveRes.rows[0].etablissement_id) {
      return res.status(400).json({ message: 'Vous n\'êtes inscrit dans aucun établissement.' });
    }
    const etabId = eleveRes.rows[0].etablissement_id;

    // Fetch student's current active class
    const classeRes = await db.query(`
      SELECT classe_id 
      FROM inscription_classes 
      WHERE eleve_id = $1 
      ORDER BY date_inscription DESC 
      LIMIT 1
    `, [eleveId]);

    if (classeRes.rows.length === 0 || !classeRes.rows[0].classe_id) {
      return res.status(400).json({ message: 'Vous n\'êtes inscrit dans aucune classe.' });
    }
    const classeId = classeRes.rows[0].classe_id;

    // Check for pending or accepted requests for the current class
    const checkExisting = await db.query(
      "SELECT id, statut, deja_telecharge FROM demandes_attestation WHERE eleve_id = $1 AND classe_id = $2 AND (statut = 'EN_ATTENTE' OR statut = 'ACCEPTE')",
      [eleveId, classeId]
    );
    if (checkExisting.rows.length > 0) {
      const existing = checkExisting.rows[0];
      if (existing.statut === 'EN_ATTENTE') {
        return res.status(400).json({ message: 'Vous avez déjà une demande en attente de traitement pour votre classe actuelle.' });
      }
      if (existing.statut === 'ACCEPTE') {
        if (existing.deja_telecharge) {
          return res.status(400).json({ message: 'Votre attestation pour votre classe actuelle a déjà été téléchargée.' });
        } else {
          return res.status(400).json({ message: 'Votre attestation pour votre classe actuelle est déjà disponible au téléchargement.' });
        }
      }
    }

    const result = await db.query(
      `INSERT INTO demandes_attestation (eleve_id, etablissement_id, classe_id, motif_demande, statut)
       VALUES ($1, $2, $3, $4, 'EN_ATTENTE') RETURNING *`,
      [eleveId, etabId, classeId, motif_demande || null]
    );

    res.status(201).json({ message: 'Demande d\'attestation soumise avec succès.', demande: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la création de la demande d\'attestation.' });
  }
});

router.get('/attestations/history', auth, checkEleveRole, async (req, res) => {
  try {
    const eleveId = await getEleveId(req.user.id);
    const result = await db.query(
      `SELECT da.*, et.nom as etablissement_nom, c.nom as classe_nom
       FROM demandes_attestation da
       JOIN etablissements et ON da.etablissement_id = et.id
       LEFT JOIN classes c ON da.classe_id = c.id
       WHERE da.eleve_id = $1
       ORDER BY da.date_demande DESC`,
      [eleveId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'historique des demandes.' });
  }
});

module.exports = router;
