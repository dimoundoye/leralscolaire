const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/authMiddleware');

// Middleware vérifiant l'accès Jury (Professeur désigné ou Office du BAC)
const checkJuryAccess = async (req, res, next) => {
  if (req.user.role === 'OFFICE_BAC' || req.user.role === 'SUPER_ADMIN') {
    return next();
  }

  try {
    const checkRes = await db.query(`
      SELECT * FROM jurys_bac
      WHERE president_prof_id = $1 AND statut = 'ACTIF'
    `, [req.user.id]);

    if (checkRes.rows.length === 0) {
      return res.status(403).json({ message: 'Accès réservé aux Présidents de Jury du BAC désignés.' });
    }

    req.juryInfo = checkRes.rows[0];
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur vérification droits Jury.' });
  }
};

// ─────────────────────────────────────────────
// 1. INFOS DU JURY ASSIGNÉ AU PRÉSIDENT CONNECTÉ
// ─────────────────────────────────────────────
router.get('/my-jury', auth, checkJuryAccess, async (req, res) => {
  try {
    let jury = req.juryInfo;
    if (!jury) {
      // Si Office du BAC, retourner le 1er jury ou celui en paramètre
      const { jury_id } = req.query;
      let query = 'SELECT * FROM jurys_bac';
      let params = [];
      if (jury_id) {
        query += ' WHERE id = $1';
        params.push(jury_id);
      }
      query += ' ORDER BY id ASC LIMIT 1';
      const r = await db.query(query, params);
      jury = r.rows[0];
    }

    if (!jury) {
      return res.status(444).json({ message: 'Aucun jury attribué.' });
    }

    res.json(jury);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur récupération jury.' });
  }
});

// ─────────────────────────────────────────────
// 2. LISTE DES CANDIDATS DU JURY ET MOYENNES
// ─────────────────────────────────────────────
router.get('/candidats', auth, checkJuryAccess, async (req, res) => {
  try {
    const juryNom = req.juryInfo ? req.juryInfo.numero_jury : req.query.numero_jury;
    let query = `
      SELECT r.id, r.annee, r.type_examen, r.serie, r.numero_table, r.statut_candidat,
             r.statut_dossier, r.moyenne as moyenne_generale, r.statut_deliberation, r.mention,
             r.verrouille, r.repeche, r.pv_signe_at, r.jury, r.centre_examen, r.publie, r.appreciation_jury,
             e.nom as eleve_nom, e.prenom as eleve_prenom, e.identifiant_national,
             et.nom as etablissement_nom, et.region,
             l.moyenne_seconde, l.moyenne_premiere, l.moyenne_terminale, l.appreciation_conseil, l.statut_validation as livret_statut
      FROM resultats_examens_nationaux r
      JOIN eleves e ON r.eleve_id = e.id
      LEFT JOIN etablissements et ON e.etablissement_id = et.id
      LEFT JOIN livrets_scolaires_bac l ON r.eleve_id = l.eleve_id
    `;
    let params = [];
    if (juryNom) {
      query += ' WHERE LOWER(r.jury) = LOWER($1) OR r.jury IS NULL';
      params.push(juryNom);
    }
    query += ' ORDER BY r.numero_table ASC NULLS LAST, e.nom ASC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur récupération des candidats du jury.' });
  }
});

// ─────────────────────────────────────────────
// 3. SAISIE & CALCUL AUTOMATIQUE DES NOTES PAR ÉPREUVE
// ─────────────────────────────────────────────

// Structure des matières et coefficients par série au Sénégal
const COEFFICIENTS_SERIES = {
  'S1': [
    { code: 'MATHS', nom: 'Mathématiques', coef: 8 },
    { code: 'PC', nom: 'Sciences Physiques', coef: 7 },
    { code: 'SVT', nom: 'Sciences de la Vie et de la Terre', coef: 3 },
    { code: 'FRANCAIS', nom: 'Français', coef: 3 },
    { code: 'PHILO', nom: 'Philosophie', coef: 2 },
    { code: 'ANGLAIS', nom: 'Anglais (LV1)', coef: 2 },
    { code: 'HG', nom: 'Histoire-Géographie', coef: 2 },
    { code: 'EPS', nom: 'Éducation Physique', coef: 1 }
  ],
  'S2': [
    { code: 'MATHS', nom: 'Mathématiques', coef: 5 },
    { code: 'PC', nom: 'Sciences Physiques', coef: 5 },
    { code: 'SVT', nom: 'Sciences de la Vie et de la Terre', coef: 5 },
    { code: 'FRANCAIS', nom: 'Français', coef: 3 },
    { code: 'PHILO', nom: 'Philosophie', coef: 2 },
    { code: 'ANGLAIS', nom: 'Anglais (LV1)', coef: 2 },
    { code: 'HG', nom: 'Histoire-Géographie', coef: 2 },
    { code: 'EPS', nom: 'Éducation Physique', coef: 1 }
  ],
  'L1': [
    { code: 'FRANCAIS', nom: 'Français', coef: 5 },
    { code: 'PHILO', nom: 'Philosophie', coef: 5 },
    { code: 'ANGLAIS', nom: 'Anglais (LV1)', coef: 4 },
    { code: 'LV2', nom: 'Langue Vivante 2 (Arabe/Esp/All)', coef: 3 },
    { code: 'HG', nom: 'Histoire-Géographie', coef: 3 },
    { code: 'MATHS', nom: 'Mathématiques', coef: 2 },
    { code: 'EPS', nom: 'Éducation Physique', coef: 1 }
  ],
  'L2': [
    { code: 'HG', nom: 'Histoire-Géographie', coef: 5 },
    { code: 'FRANCAIS', nom: 'Français', coef: 4 },
    { code: 'PHILO', nom: 'Philosophie', coef: 4 },
    { code: 'ANGLAIS', nom: 'Anglais (LV1)', coef: 3 },
    { code: 'LV2', nom: 'Langue Vivante 2 (Arabe/Esp/All)', coef: 3 },
    { code: 'MATHS', nom: 'Mathématiques', coef: 2 },
    { code: 'EPS', nom: 'Éducation Physique', coef: 1 }
  ],
  'STEG': [
    { code: 'COMPTA', nom: 'Comptabilité & Gestion', coef: 6 },
    { code: 'ECONOMIE', nom: 'Économie & Droit', coef: 5 },
    { code: 'MATHS', nom: 'Mathématiques Financières', coef: 4 },
    { code: 'FRANCAIS', nom: 'Français', coef: 3 },
    { code: 'PHILO', nom: 'Philosophie', coef: 2 },
    { code: 'ANGLAIS', nom: 'Anglais Commercial', coef: 2 },
    { code: 'EPS', nom: 'Éducation Physique', coef: 1 }
  ]
};

// Obtenir la grille de notes d'un candidat
router.get('/candidats/:id/notes', auth, checkJuryAccess, async (req, res) => {
  try {
    const candRes = await db.query('SELECT * FROM resultats_examens_nationaux WHERE id = $1', [req.params.id]);
    if (candRes.rows.length === 0) return res.status(404).json({ message: 'Candidat introuvable.' });
    const cand = candRes.rows[0];

    const notesRes = await db.query('SELECT * FROM notes_candidats_bac WHERE candidat_id = $1', [req.params.id]);
    const existingNotes = notesRes.rows;

    const serieTemplate = COEFFICIENTS_SERIES[cand.serie] || COEFFICIENTS_SERIES['S2'];
    const mergedNotes = serieTemplate.map(m => {
      const found = existingNotes.find(n => n.matiere_code === m.code);
      return {
        matiere_code: m.code,
        matiere_nom: m.nom,
        coefficient: m.coef,
        note: found ? (found.note !== null ? parseFloat(found.note) : '') : '',
        note_2nd_tour: found ? (found.note_2nd_tour !== null ? parseFloat(found.note_2nd_tour) : '') : '',
        statut_presence: found ? found.statut_presence : 'PRESENT'
      };
    });

    res.json({ candidat: cand, notes: mergedNotes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur récupération notes candidat.' });
  }
});

// Enregistrer les notes, appréciation et calculer automatiquement la moyenne & admissibilité
router.post('/candidats/:id/notes', auth, checkJuryAccess, async (req, res) => {
  const { notes, appreciation_jury } = req.body;
  if (!Array.isArray(notes)) return res.status(400).json({ message: 'Grille de notes invalide.' });

  try {
    const candRes = await db.query('SELECT * FROM resultats_examens_nationaux WHERE id = $1', [req.params.id]);
    if (candRes.rows.length === 0) return res.status(404).json({ message: 'Candidat introuvable.' });
    const cand = candRes.rows[0];

    if (cand.verrouille) {
      return res.status(403).json({ message: 'Les notes de ce jury sont verrouillées et signées en délibération.' });
    }

    let totalPoints = 0;
    let totalCoefs = 0;
    let aUneAbsenceInjustifiee = false;
    let aUneNote2ndTour = false;

    for (const n of notes) {
      const valNote1 = (n.note !== '' && n.note !== null) ? parseFloat(n.note) : null;
      const valNote2 = (n.note_2nd_tour !== '' && n.note_2nd_tour !== null) ? parseFloat(n.note_2nd_tour) : null;
      const coef = parseInt(n.coefficient) || 1;
      const pres = n.statut_presence || 'PRESENT';

      if (pres === 'ABI') aUneAbsenceInjustifiee = true;
      if (valNote2 !== null) aUneNote2ndTour = true;

      // Note effective retenue pour le calcul (meilleure note entre 1er tour et 2nd tour)
      let valNoteEffective = null;
      if (valNote1 !== null && valNote2 !== null) {
        valNoteEffective = Math.max(valNote1, valNote2);
      } else if (valNote2 !== null) {
        valNoteEffective = valNote2;
      } else if (valNote1 !== null) {
        valNoteEffective = valNote1;
      }

      if (pres === 'PRESENT' && valNoteEffective !== null) {
        totalPoints += valNoteEffective * coef;
        totalCoefs += coef;
      }

      await db.query(`
        INSERT INTO notes_candidats_bac (candidat_id, matiere_code, matiere_nom, note, note_2nd_tour, coefficient, statut_presence, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        ON CONFLICT (candidat_id, matiere_code)
        DO UPDATE SET note = EXCLUDED.note, note_2nd_tour = EXCLUDED.note_2nd_tour, coefficient = EXCLUDED.coefficient, statut_presence = EXCLUDED.statut_presence, updated_at = NOW()
      `, [req.params.id, n.matiere_code, n.matiere_nom, valNote1, valNote2, coef, pres]);
    }

    let moyenneGen = totalCoefs > 0 ? (totalPoints / totalCoefs) : 0;
    moyenneGen = Math.round(moyenneGen * 100) / 100;

    let statutDelib = 'EN_ATTENTE';
    let mention = null;

    if (aUneAbsenceInjustifiee) {
      statutDelib = 'AJOURNÉ';
    } else if (cand.statut_deliberation === 'SECOND_TOUR' || aUneNote2ndTour) {
      // Délibération 2nd Tour
      if (moyenneGen >= 10.00) {
        statutDelib = 'ADMIS_2ND_TOUR';
        mention = 'PASSABLE';
      } else {
        statutDelib = 'AJOURNÉ';
      }
    } else if (moyenneGen >= 10.00) {
      statutDelib = 'ADMIS';
      if (moyenneGen >= 16.00) mention = 'TRÈS_BIEN';
      else if (moyenneGen >= 14.00) mention = 'BIEN';
      else if (moyenneGen >= 12.00) mention = 'ASSEZ_BIEN';
      else mention = 'PASSABLE';
    } else if (moyenneGen >= 9.00 && moyenneGen < 10.00) {
      statutDelib = 'SECOND_TOUR';
    } else if (moyenneGen > 0) {
      statutDelib = 'AJOURNÉ';
    }

    const statutCandText = (statutDelib === 'ADMIS' || statutDelib === 'ADMIS_2ND_TOUR') ? 'ADMIS' : statutDelib === 'SECOND_TOUR' ? 'CONVOQUÉ' : 'AJOURNÉ';

    const updatedCand = await db.query(`
      UPDATE resultats_examens_nationaux
      SET moyenne = $1, statut_deliberation = $2, mention = $3,
          statut_candidat = $4, appreciation_jury = $5, updated_at = NOW()
      WHERE id = $6 RETURNING *
    `, [moyenneGen, statutDelib, mention, statutCandText, appreciation_jury || null, req.params.id]);

    res.json({
      message: `Notes & Appréciation enregistrées. Moyenne : ${moyenneGen}/20 — Statut : ${statutDelib}`,
      candidat: updatedCand.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur enregistrement des notes.' });
  }
});

// ─────────────────────────────────────────────
// 4. DÉCISION DE REPÊCHAGE DU JURY (SUR LIVRET)
// ─────────────────────────────────────────────
router.post('/candidats/:id/repecher', auth, checkJuryAccess, async (req, res) => {
  const { nouvelle_moyenne, statut_deliberation, appreciation_jury } = req.body;
  try {
    const candRes = await db.query('SELECT * FROM resultats_examens_nationaux WHERE id = $1', [req.params.id]);
    if (candRes.rows.length === 0) return res.status(404).json({ message: 'Candidat introuvable.' });
    const cand = candRes.rows[0];

    if (cand.verrouille) {
      return res.status(403).json({ message: 'Délibération déjà verrouillée.' });
    }

    const updated = await db.query(`
      UPDATE resultats_examens_nationaux
      SET moyenne = $1, statut_deliberation = $2, repeche = TRUE,
          statut_candidat = $3, appreciation_jury = COALESCE($4, appreciation_jury), updated_at = NOW()
      WHERE id = $5 RETURNING *
    `, [
      nouvelle_moyenne || 10.00,
      statut_deliberation || 'ADMIS',
      (statut_deliberation || 'ADMIS') === 'ADMIS' ? 'ADMIS' : 'CONVOQUÉ',
      appreciation_jury || null,
      req.params.id
    ]);

    res.json({ message: 'Candidat repêché avec succès sur avis du Jury et Livret Scolaire !', candidat: updated.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur repêchage candidat.' });
  }
});

// ─────────────────────────────────────────────
// 5. CLÔTURE DÉFINITIVE & SIGNATURE DU PV DE JURY
// ─────────────────────────────────────────────
router.put('/verrouiller', auth, checkJuryAccess, async (req, res) => {
  try {
    const juryNom = req.juryInfo ? req.juryInfo.numero_jury : req.body.numero_jury;
    if (!juryNom) return res.status(400).json({ message: 'Numéro de jury requis.' });

    await db.query(`
      UPDATE resultats_examens_nationaux
      SET verrouille = TRUE, pv_signe_at = NOW()
      WHERE LOWER(jury) = LOWER($1) OR jury IS NULL
    `, [juryNom]);

    await db.query(`
      UPDATE jurys_bac
      SET statut = 'CLÔTURÉ'
      WHERE LOWER(numero_jury) = LOWER($1)
    `, [juryNom]);

    res.json({ message: `Le Procès-Verbal du ${juryNom} a été verrouillé et signé numériquement avec succès. Publication disponible sur le portail candidat.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur clôture délibération.' });
  }
});

// ─────────────────────────────────────────────
// 6. PUBLICATION DIRECTE DES RÉSULTATS & NOTIFICATION ÉLÈVES
// ─────────────────────────────────────────────
router.put('/publier', auth, checkJuryAccess, async (req, res) => {
  try {
    const juryNom = req.juryInfo ? req.juryInfo.numero_jury : req.body.numero_jury;
    if (!juryNom) return res.status(400).json({ message: 'Numéro de jury requis.' });

    await db.query(`
      UPDATE resultats_examens_nationaux
      SET publie = TRUE, updated_at = NOW()
      WHERE LOWER(jury) = LOWER($1) OR jury IS NULL
    `, [juryNom]);

    const pubRes = await db.query(`
      SELECT r.eleve_id, r.numero_table, r.moyenne, r.statut_deliberation, r.mention, e.user_id
      FROM resultats_examens_nationaux r
      JOIN eleves e ON r.eleve_id = e.id
      WHERE LOWER(r.jury) = LOWER($1) OR r.jury IS NULL
    `, [juryNom]);

    for (const c of pubRes.rows) {
      if (c.user_id) {
        await db.query(`
          INSERT INTO notifications (user_id, titre, description, type, lu, created_at)
          VALUES ($1, 'Résultats Officiels Publiés !', $2, 'DELIBERATION', FALSE, NOW())
        `, [
          c.user_id,
          `Vos résultats officiels du ${juryNom} ont été publiés : Statut ${c.statut_deliberation || 'DÉLIBÉRÉ'}${c.moyenne ? ' avec la moyenne de ' + c.moyenne + '/20' : ''}.`
        ]);
      }
    }

    res.json({ message: `Résultats du ${juryNom} publiés sur la plateforme ! ${pubRes.rows.length} élèves notifiés automatiquement.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur publication des résultats.' });
  }
});

module.exports = router;
