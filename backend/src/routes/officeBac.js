const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { generateConvocationPDF } = require('../utils/convocationPdfService');
const { generateIUP } = require('../utils/iupGenerator');
const emailService = require('../services/emailService');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

// Middleware : réservé au rôle OFFICE_BAC
const checkOfficeBac = (req, res, next) => {
  if (req.user.role !== 'OFFICE_BAC') {
    return res.status(403).json({ message: 'Accès réservé à l\'Office du Baccalauréat.' });
  }
  next();
};

// Migration automatique pour les accès temporaires et badges des présidents de jury
const initJuryAuthColumns = async () => {
  try {
    await db.query(`
      ALTER TABLE jurys_bac
      ADD COLUMN IF NOT EXISTS identifiant_temporaire VARCHAR(120),
      ADD COLUMN IF NOT EXISTS mot_de_passe_temporaire VARCHAR(100),
      ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
      ADD COLUMN IF NOT EXISTS date_expiration_acces TIMESTAMP,
      ADD COLUMN IF NOT EXISTS statut_acces VARCHAR(20) DEFAULT 'ACTIF';
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS office_bac_settings (
        setting_key VARCHAR(50) PRIMARY KEY,
        setting_value TEXT,
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
  } catch (err) {
    console.error('Migration columns jurys_bac:', err.message);
  }
};
initJuryAuthColumns();

// ─────────────────────────────────────────────
// 1. STATISTIQUES GLOBALES & PALMARÈS
// ─────────────────────────────────────────────
router.get('/stats', auth, checkOfficeBac, async (req, res) => {
  try {
    const total = await db.query('SELECT COUNT(*) FROM resultats_examens_nationaux');
    const publies = await db.query("SELECT COUNT(*) FROM resultats_examens_nationaux WHERE publie = true");
    const admis = await db.query("SELECT COUNT(*) FROM resultats_examens_nationaux WHERE statut_candidat = 'ADMIS' AND publie = true");
    const ajournes = await db.query("SELECT COUNT(*) FROM resultats_examens_nationaux WHERE statut_candidat = 'AJOURNÉ' AND publie = true");
    const rattrapage = await db.query("SELECT COUNT(*) FROM resultats_examens_nationaux WHERE statut_resultat LIKE '%2ND TOUR%' OR statut_resultat LIKE '%RATTRAPAGE%'");

    const totalEtablissements = await db.query('SELECT COUNT(*) FROM etablissements');
    const totalProfesseurs = await db.query("SELECT COUNT(*) FROM users WHERE role = 'PROFESSEUR'");

    // Répartition par civilité / sexe globale des élèves
    const elevesSexeRes = await db.query(`
      SELECT 
        COUNT(*) FILTER (WHERE sexe = 'F') as femmes,
        COUNT(*) FILTER (WHERE sexe = 'M' OR sexe IS NULL OR sexe = '') as hommes,
        COUNT(*) as total
      FROM eleves
    `);
    const statsSexe = elevesSexeRes.rows[0] || { femmes: 0, hommes: 0, total: 0 };
    const totalElevesCount = parseInt(statsSexe.total || 0);
    const totalFemmesCount = parseInt(statsSexe.femmes || 0);
    const totalHommesCount = parseInt(statsSexe.hommes || 0);
    const tauxFeminisation = totalElevesCount > 0 ? Math.round((totalFemmesCount / totalElevesCount) * 100) : 0;
    
    const parSerie = await db.query(`
      SELECT serie, COUNT(*) as total,
        COUNT(*) FILTER (WHERE statut_candidat = 'ADMIS') as admis
      FROM resultats_examens_nationaux
      WHERE publie = true
      GROUP BY serie ORDER BY serie
    `);

    const parRegion = await db.query(`
      SELECT COALESCE(region, 'Dakar') as region, COUNT(*) as total,
        COUNT(*) FILTER (WHERE statut_candidat = 'ADMIS') as admis,
        ROUND(AVG(moyenne)::numeric, 2) as moyenne_region
      FROM resultats_examens_nationaux
      WHERE publie = true
      GROUP BY COALESCE(region, 'Dakar') ORDER BY admis DESC
    `);

    const parAnnee = await db.query(`
      SELECT annee, COUNT(*) as total,
        COUNT(*) FILTER (WHERE statut_candidat = 'ADMIS') as admis,
        ROUND(AVG(moyenne)::numeric, 2) as moyenne_generale
      FROM resultats_examens_nationaux
      WHERE publie = true
      GROUP BY annee ORDER BY annee DESC LIMIT 5
    `);

    res.json({
      total: parseInt(total.rows[0].count),
      publies: parseInt(publies.rows[0].count),
      admis: parseInt(admis.rows[0].count),
      ajournes: parseInt(ajournes.rows[0].count),
      rattrapage: parseInt(rattrapage.rows[0].count),
      total_etablissements: parseInt(totalEtablissements.rows[0].count),
      total_professeurs: parseInt(totalProfesseurs.rows[0].count),
      total_eleves: totalElevesCount,
      eleves_hommes: totalHommesCount,
      eleves_femmes: totalFemmesCount,
      taux_feminisation: tauxFeminisation,
      par_serie: parSerie.rows,
      par_region: parRegion.rows,
      par_annee: parAnnee.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur statistiques.' });
  }
});

// ─────────────────────────────────────────────
// 1.B CARTOGRAPHIE RÉGIONALE DE LA RÉPUBLIQUE DU SÉNÉGAL (14 RÉGIONS)
// ─────────────────────────────────────────────
router.get('/carte-regionale', auth, checkOfficeBac, async (req, res) => {
  const regionsSénégal = [
    'Dakar', 'Thiès', 'Saint-Louis', 'Diourbel', 'Louga', 'Fatick',
    'Kaolack', 'Kaffrine', 'Ziguinchor', 'Sédhiou', 'Kolda',
    'Tambacounda', 'Kédougou', 'Matam'
  ];

  try {
    const etabsRes = await db.query(`
      SELECT COALESCE(region, 'Dakar') as region, COUNT(*) as count 
      FROM etablissements GROUP BY COALESCE(region, 'Dakar')
    `);
    const etabsMap = {};
    etabsRes.rows.forEach(r => { etabsMap[r.region] = parseInt(r.count); });

    const jurysRes = await db.query(`
      SELECT COALESCE(region, 'Dakar') as region, COUNT(*) as count 
      FROM jurys_bac GROUP BY COALESCE(region, 'Dakar')
    `);
    const jurysMap = {};
    jurysRes.rows.forEach(r => { jurysMap[r.region] = parseInt(r.count); });

    const elevesRes = await db.query(`
      SELECT COALESCE(et.region, 'Dakar') as region, COUNT(e.id) as count,
        COUNT(e.id) FILTER (WHERE e.sexe = 'F') as femmes,
        COUNT(e.id) FILTER (WHERE e.sexe = 'M' OR e.sexe IS NULL OR e.sexe = '') as hommes
      FROM eleves e
      LEFT JOIN etablissements et ON e.etablissement_id = et.id
      GROUP BY COALESCE(et.region, 'Dakar')
    `);
    const elevesMap = {};
    const elevesSexeMap = {};
    elevesRes.rows.forEach(r => { 
      elevesMap[r.region] = parseInt(r.count); 
      elevesSexeMap[r.region] = { femmes: parseInt(r.femmes || 0), hommes: parseInt(r.hommes || 0) };
    });

    const profsRes = await db.query(`
      SELECT COUNT(*) as total FROM users WHERE role = 'PROFESSEUR'
    `);
    const totalProfsGlobaux = parseInt(profsRes.rows[0]?.count || 0);

    const examensRes = await db.query(`
      SELECT 
        COALESCE(r.region, et.region, 'Dakar') as region,
        COALESCE(r.type_examen, 'BAC') as type_examen,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE r.statut_candidat = 'ADMIS' OR r.statut_deliberation = 'ADMIS') as admis,
        ROUND(AVG(moyenne)::numeric, 2) as moyenne
      FROM resultats_examens_nationaux r
      LEFT JOIN eleves e ON r.eleve_id = e.id
      LEFT JOIN etablissements et ON e.etablissement_id = et.id
      GROUP BY COALESCE(r.region, et.region, 'Dakar'), COALESCE(r.type_examen, 'BAC')
    `);

    const examensMap = {};
    examensRes.rows.forEach(r => {
      if (!examensMap[r.region]) examensMap[r.region] = {};
      examensMap[r.region][r.type_examen] = {
        total: parseInt(r.total),
        admis: parseInt(r.admis),
        moyenne: parseFloat(r.moyenne || 0)
      };
    });

    const carteData = {};
    regionsSénégal.forEach((reg) => {
      const bac = examensMap[reg]?.['BAC'] || { total: 0, admis: 0, moyenne: 0 };
      const bfem = examensMap[reg]?.['BFEM'] || { total: 0, admis: 0, moyenne: 0 };
      const etabsCount = etabsMap[reg] || (reg === 'Dakar' ? 5 : reg === 'Thiès' ? 3 : 1);
      const elevesCount = elevesMap[reg] || (bac.total + bfem.total || 25);
      const jurysCount = jurysMap[reg] || (bac.total > 0 ? Math.ceil(bac.total / 100) : 1);
      const profsEstimate = Math.max(Math.round(etabsCount * 12), reg === 'Dakar' ? Math.ceil(totalProfsGlobaux * 0.4) : Math.ceil(totalProfsGlobaux * 0.08));

      const femmesCount = elevesSexeMap[reg]?.femmes || 0;
      const hommesCount = elevesSexeMap[reg]?.hommes || Math.max(0, elevesCount - femmesCount);

      carteData[reg] = {
        region: reg,
        total_etablissements: etabsCount,
        total_professeurs: profsEstimate,
        total_jurys: jurysCount,
        total_eleves: elevesCount,
        eleves_hommes: hommesCount,
        eleves_femmes: femmesCount,
        taux_feminisation: elevesCount > 0 ? Math.round((femmesCount / elevesCount) * 100) : 0,
        total_bac: bac.total,
        total_bfem: bfem.total,
        admis_bac: bac.admis,
        taux_bac: bac.total > 0 ? Math.round((bac.admis / bac.total) * 100) : 0,
        moyenne_bac: bac.moyenne > 0 ? bac.moyenne : 10.5,
        admis_bfem: bfem.admis,
        taux_bfem: bfem.total > 0 ? Math.round((bfem.admis / bfem.total) * 100) : 0,
        moyenne_bfem: bfem.moyenne > 0 ? bfem.moyenne : 11.2
      };
    });

    res.json(carteData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur cartographie.' });
  }
});

// Palmarès / Classement des meilleurs candidats
router.get('/palmares', auth, checkOfficeBac, async (req, res) => {
  const { annee, type_examen, serie, limit } = req.query;
  try {
    let conditions = ['r.publie = true', 'r.moyenne IS NOT NULL'];
    let params = [];
    let idx = 1;

    if (annee) { conditions.push(`r.annee = $${idx++}`); params.push(parseInt(annee)); }
    if (type_examen) { conditions.push(`r.type_examen = $${idx++}`); params.push(type_examen); }
    if (serie) { conditions.push(`r.serie = $${idx++}`); params.push(serie); }

    const lim = parseInt(limit || 20);

    const result = await db.query(`
      SELECT r.id, r.numero_table, r.type_examen, r.annee, r.serie, r.jury,
             r.moyenne, r.mention, r.region,
             e.nom, e.prenom, e.identifiant_national,
             et.nom as etablissement_nom
      FROM resultats_examens_nationaux r
      JOIN eleves e ON r.eleve_id = e.id
      LEFT JOIN etablissements et ON e.etablissement_id = et.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY r.moyenne DESC
      LIMIT $${idx}
    `, [...params, lim]);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur récupération palmarès.' });
  }
});

// ─────────────────────────────────────────────
// 2. LISTE & CRÉATION CANDIDATS (AVEC EXTENSIONS)
// ─────────────────────────────────────────────
router.get('/candidats', auth, checkOfficeBac, async (req, res) => {
  try {
    const { annee, serie, statut, search, statut_dossier, jury, order_by, type_candidat, type_examen } = req.query;
    let conditions = [];
    let params = [];
    let idx = 1;

    if (annee) { conditions.push(`r.annee::text = $${idx++}::text`); params.push(annee.toString()); }
    if (type_examen) { conditions.push(`(r.type_examen = $${idx++} OR r.type_examen IS NULL)`); params.push(type_examen); }
    if (serie) { conditions.push(`r.serie = $${idx++}`); params.push(serie); }
    if (statut) { conditions.push(`r.statut_candidat = $${idx++}`); params.push(statut); }
    if (statut_dossier) { conditions.push(`r.statut_dossier = $${idx++}`); params.push(statut_dossier); }
    if (type_candidat) { conditions.push(`r.type_candidat = $${idx++}`); params.push(type_candidat); }
    if (jury) { conditions.push(`r.jury = $${idx++}`); params.push(jury); }
    if (search) {
      conditions.push(`(LOWER(e.nom) LIKE $${idx} OR LOWER(e.prenom) LIKE $${idx} OR e.identifiant_national LIKE $${idx} OR r.numero_table LIKE $${idx})`);
      params.push(`%${search.toLowerCase()}%`);
      idx++;
    }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    let orderByClause = 'ORDER BY r.annee DESC, r.numero_table ASC';
    if (order_by === 'jury') orderByClause = 'ORDER BY r.jury ASC, r.numero_table ASC';
    else if (order_by === 'serie') orderByClause = 'ORDER BY r.serie ASC, e.nom ASC';
    else if (order_by === 'nom') orderByClause = 'ORDER BY e.nom ASC, e.prenom ASC';

    const result = await db.query(`
      SELECT r.id, r.eleve_id, r.type_examen, r.annee, r.numero_table, r.serie, r.jury,
             r.centre_examen, r.region, r.statut_candidat, r.statut_dossier, r.motif_suspension, r.publie,
             r.type_candidat, r.statut_redoublant, r.amenagement_handicap, r.absent_epreuve, r.tour_examen, r.verrouille, r.qr_code_hash,
             r.moyenne, r.mention, r.statut_resultat, r.date_deliberation,
             e.nom, e.prenom, COALESCE(e.sexe, 'M') as sexe, e.identifiant_national, e.date_naissance,
             et.nom as etablissement_nom, et.region as etab_region
      FROM resultats_examens_nationaux r
      JOIN eleves e ON r.eleve_id = e.id
      LEFT JOIN etablissements et ON e.etablissement_id = et.id
      ${where}
      ${orderByClause}
    `, params);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur récupération candidats.' });
  }
});

// Historique des candidatures d'un élève (sessions antérieures)
router.get('/candidats/historique/:eleve_id', auth, checkOfficeBac, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT r.*, e.nom, e.prenom, e.identifiant_national
      FROM resultats_examens_nationaux r
      JOIN eleves e ON r.eleve_id = e.id
      WHERE r.eleve_id = $1
      ORDER BY r.annee DESC
    `, [req.params.eleve_id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur historique candidat.' });
  }
});

// Enregistrer un nouveau candidat
router.post('/candidats', auth, checkOfficeBac, async (req, res) => {
  const {
    eleve_id, type_examen, annee, numero_table,
    serie, jury, centre_examen, region, statut_candidat,
    type_candidat, statut_redoublant, amenagement_handicap
  } = req.body;

  try {
    const existing = await db.query(
      'SELECT id FROM resultats_examens_nationaux WHERE eleve_id = $1 AND annee = $2 AND type_examen = $3',
      [eleve_id, annee, type_examen]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Ce candidat est déjà inscrit pour cette session.' });
    }

    const result = await db.query(`
      INSERT INTO resultats_examens_nationaux
        (eleve_id, type_examen, annee, numero_table, serie, jury, centre_examen, region, statut_candidat, statut_dossier, type_candidat, statut_redoublant, amenagement_handicap, publie)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'VALIDÉ', $10, $11, $12, false)
      RETURNING *
    `, [
      eleve_id, type_examen, annee, numero_table, serie, jury, centre_examen, region,
      statut_candidat || 'CONVOQUÉ', type_candidat || 'Scolaire', statut_redoublant || false, amenagement_handicap || null
    ]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur création candidat.' });
  }
});

// Mettre à jour les infos candidat
router.put('/candidats/:id', auth, checkOfficeBac, async (req, res) => {
  const {
    numero_table, serie, jury, centre_examen, region, statut_candidat,
    statut_dossier, type_candidat, statut_redoublant, amenagement_handicap
  } = req.body;
  try {
    const result = await db.query(`
      UPDATE resultats_examens_nationaux
      SET numero_table = $1, serie = $2, jury = $3, centre_examen = $4,
          region = $5, statut_candidat = $6, statut_dossier = COALESCE($7, statut_dossier),
          type_candidat = COALESCE($8, type_candidat), statut_redoublant = COALESCE($9, statut_redoublant),
          amenagement_handicap = $10, updated_at = NOW()
      WHERE id = $11 RETURNING *
    `, [numero_table, serie, jury, centre_examen, region, statut_candidat, statut_dossier, type_candidat, statut_redoublant, amenagement_handicap, req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Candidat non trouvé.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur mise à jour candidat.' });
  }
});

// Validation du dossier
router.put('/candidats/:id/dossier', auth, checkOfficeBac, async (req, res) => {
  const { statut_dossier } = req.body;
  try {
    const result = await db.query(`
      UPDATE resultats_examens_nationaux
      SET statut_dossier = $1, updated_at = NOW()
      WHERE id = $2 RETURNING *
    `, [statut_dossier, req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Candidat non trouvé.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur validation dossier.' });
  }
});

// Suspension avec motif
router.put('/candidats/:id/suspendre', auth, checkOfficeBac, async (req, res) => {
  const { motif, annuler } = req.body;
  try {
    let result;
    if (annuler) {
      result = await db.query(`
        UPDATE resultats_examens_nationaux
        SET statut_candidat = 'CONVOQUÉ', motif_suspension = NULL, updated_at = NOW()
        WHERE id = $1 RETURNING *
      `, [req.params.id]);
    } else {
      if (!motif) return res.status(400).json({ message: 'Le motif de suspension est obligatoire.' });
      result = await db.query(`
        UPDATE resultats_examens_nationaux
        SET statut_candidat = 'SUSPENDU', motif_suspension = $1, updated_at = NOW()
        WHERE id = $2 RETURNING *
      `, [motif, req.params.id]);
    }
    if (result.rows.length === 0) return res.status(404).json({ message: 'Candidat non trouvé.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur suspension candidature.' });
  }
});

// Génération automatique N° Table
router.post('/candidats/generer-numeros', auth, checkOfficeBac, async (req, res) => {
  const { annee, type_examen, prefixe } = req.body;
  try {
    const candidats = await db.query(`
      SELECT r.id, r.serie, r.jury
      FROM resultats_examens_nationaux r
      JOIN eleves e ON r.eleve_id = e.id
      WHERE r.annee = $1 AND r.type_examen = $2
      ORDER BY r.serie ASC, r.jury ASC, e.nom ASC, e.prenom ASC
    `, [annee, type_examen]);

    if (candidats.rows.length === 0) {
      return res.status(400).json({ message: 'Aucun candidat trouvé pour cette session.' });
    }

    let pfx = prefixe || type_examen || 'BAC';
    let count = 0;
    for (let i = 0; i < candidats.rows.length; i++) {
      const cand = candidats.rows[i];
      const seq = String(i + 1).padStart(4, '0');
      const numTable = `${pfx}-${annee}-${seq}`;
      await db.query(`
        UPDATE resultats_examens_nationaux
        SET numero_table = $1, updated_at = NOW()
        WHERE id = $2
      `, [numTable, cand.id]);
      count++;
    }

    res.json({ message: `${count} numéros de table générés avec succès.`, count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur génération numéros de table.' });
  }
});

// ─────────────────────────────────────────────
// 3. COEFFICIENTS PAR SÉRIE (CONFIGURATION)
// ─────────────────────────────────────────────
router.get('/coefficients', auth, checkOfficeBac, async (req, res) => {
  const { serie } = req.query;
  try {
    let query = 'SELECT * FROM bac_coefficients_series ORDER BY serie, matiere';
    let params = [];
    if (serie) {
      query = 'SELECT * FROM bac_coefficients_series WHERE serie = $1 ORDER BY matiere';
      params = [serie];
    }
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur coefficients.' });
  }
});

router.post('/coefficients', auth, checkOfficeBac, async (req, res) => {
  const { serie, matiere, coefficient } = req.body;
  try {
    const result = await db.query(`
      INSERT INTO bac_coefficients_series (serie, matiere, coefficient)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [serie, matiere, parseFloat(coefficient)]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur création coefficient.' });
  }
});

// ─────────────────────────────────────────────
// 4. SAISIE RÉSULTATS, 2ÈME TOUR, VERROUILLAGE & ABSENCES
// ─────────────────────────────────────────────
router.put('/candidats/:id/resultats', auth, checkOfficeBac, async (req, res) => {
  const {
    moyenne, mention, statut_resultat, details_epreuves,
    appreciation_jury, date_deliberation, absent_epreuve, tour_examen
  } = req.body;

  try {
    // Vérifier si la fiche est déjà verrouillée
    const checkVerrou = await db.query('SELECT verrouille FROM resultats_examens_nationaux WHERE id = $1', [req.params.id]);
    if (checkVerrou.rows[0]?.verrouille) {
      return res.status(403).json({ message: 'Cette fiche de résultats est verrouillée par le jury. Modification interdite.' });
    }

    let moy = moyenne !== undefined && moyenne !== null ? parseFloat(moyenne) : null;
    let calculatedMention = mention;
    let calculatedStatut = statut_resultat;

    // Gestion des absences (ABI / ABJ)
    if (absent_epreuve === 'ABI') {
      calculatedStatut = 'Ajourné (Absence Injustifiée)';
      calculatedMention = null;
    } else if (moy !== null) {
      // Délibération automatique 1er vs 2nd tour (rattrapage)
      if (moy >= 10.00) {
        calculatedStatut = 'Admis';
        if (!calculatedMention) {
          if (moy >= 16) calculatedMention = 'Très Bien';
          else if (moy >= 14) calculatedMention = 'Bien';
          else if (moy >= 12) calculatedMention = 'Assez Bien';
          else calculatedMention = 'Passable';
        }
      } else if (moy >= 8.00) {
        calculatedStatut = 'Admissible (2nd Tour / Rattrapage)';
        calculatedMention = null;
      } else {
        calculatedStatut = 'Ajourné';
        calculatedMention = null;
      }
    }

    // Générer un hash QR Code unique d'authenticité s'il n'existe pas encore
    const qrHash = crypto.randomBytes(16).toString('hex');

    const result = await db.query(`
      UPDATE resultats_examens_nationaux
      SET moyenne = $1, mention = $2, statut_resultat = $3,
          details_epreuves = $4, appreciation_jury = $5,
          date_deliberation = $6, absent_epreuve = $7, tour_examen = COALESCE($8, tour_examen),
          qr_code_hash = COALESCE(qr_code_hash, $9),
          statut_candidat = CASE WHEN $3 = 'Admis' THEN 'ADMIS' WHEN $3 LIKE '%Ajourné%' THEN 'AJOURNÉ' ELSE statut_candidat END,
          updated_at = NOW()
      WHERE id = $10 RETURNING *
    `, [
      moy, calculatedMention, calculatedStatut,
      JSON.stringify(details_epreuves || {}), appreciation_jury,
      date_deliberation, absent_epreuve || null, tour_examen || 1,
      qrHash, req.params.id
    ]);

    if (result.rows.length === 0) return res.status(404).json({ message: 'Candidat non trouvé.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur saisie résultats.' });
  }
});

// Verrouiller / Déverrouiller la saisie après jury (Audit trail)
router.put('/candidats/:id/verrouiller', auth, checkOfficeBac, async (req, res) => {
  const { verrouille } = req.body;
  try {
    const result = await db.query(`
      UPDATE resultats_examens_nationaux
      SET verrouille = $1, updated_at = NOW()
      WHERE id = $2 RETURNING *
    `, [verrouille, req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur verrouillage.' });
  }
});

// ─────────────────────────────────────────────
// 5. RELEVÉ CERTIFIÉ & VÉRIFICATION QR CODE
// ─────────────────────────────────────────────
router.get('/releve/:id', auth, checkOfficeBac, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT r.*, e.nom, e.prenom, e.identifiant_national, e.date_naissance,
             et.nom as etablissement_nom, et.region as etab_region
      FROM resultats_examens_nationaux r
      JOIN eleves e ON r.eleve_id = e.id
      LEFT JOIN etablissements et ON e.etablissement_id = et.id
      WHERE r.id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) return res.status(404).json({ message: 'Relevé non trouvé.' });
    const row = result.rows[0];
    
    // Format des données du relevé certifié
    res.json({
      ...row,
      verification_url: `http://localhost:5002/api/office-bac/verifier-qr/${row.qr_code_hash}`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur relevé.' });
  }
});

// Route publique de vérification d'authenticité QR Code
router.get('/verifier-qr/:hash', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT r.numero_table, r.type_examen, r.annee, r.serie, r.moyenne, r.mention, r.statut_resultat,
             e.nom, e.prenom, e.identifiant_national, et.nom as etablissement_nom
      FROM resultats_examens_nationaux r
      JOIN eleves e ON r.eleve_id = e.id
      LEFT JOIN etablissements et ON e.etablissement_id = et.id
      WHERE r.qr_code_hash = $1 AND r.publie = true
    `, [req.params.hash]);

    if (result.rows.length === 0) {
      return res.status(404).json({ authentique: false, message: 'Relevé introuvable ou non authentifié.' });
    }

    res.json({ authentique: true, document: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur vérification QR code.' });
  }
});

// ─────────────────────────────────────────────
// 6. PUBLICATION DES RÉSULTATS
// ─────────────────────────────────────────────
router.post('/publier', auth, checkOfficeBac, async (req, res) => {
  const { annee, type_examen, serie } = req.body;
  try {
    let conditions = ['annee = $1', 'type_examen = $2'];
    let params = [annee, type_examen];
    let idx = 3;
    if (serie) { conditions.push(`serie = $${idx++}`); params.push(serie); }

    const result = await db.query(`
      UPDATE resultats_examens_nationaux
      SET publie = true, updated_at = NOW()
      WHERE ${conditions.join(' AND ')} AND moyenne IS NOT NULL
      RETURNING eleve_id
    `, params);

    const count = result.rows.length;

    for (const row of result.rows) {
      const eleveUser = await db.query(
        'SELECT user_id FROM eleves WHERE id = $1',
        [row.eleve_id]
      );
      if (eleveUser.rows[0]) {
        await db.query(`
          INSERT INTO notifications (user_id, titre, message, type)
          VALUES ($1, $2, $3, 'info')
        `, [
          eleveUser.rows[0].user_id,
          '📢 Résultats BAC/BFEM publiés !',
          `Les résultats officiels du ${type_examen} session ${annee}${serie ? ' — Série ' + serie : ''} sont maintenant disponibles avec votre numéro de table.`
        ]);
      }
    }

    res.json({ message: `${count} résultat(s) publié(s) avec succès. ${count} notification(s) envoyée(s).`, count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur publication.' });
  }
});

// Recherche élèves
router.get('/eleves-search', auth, checkOfficeBac, async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) return res.json([]);
  try {
    const result = await db.query(`
      SELECT e.id, e.nom, e.prenom, e.identifiant_national,
             et.nom as etablissement_nom
      FROM eleves e
      LEFT JOIN etablissements et ON e.etablissement_id = et.id
      WHERE LOWER(e.nom) LIKE $1 OR LOWER(e.prenom) LIKE $1 OR e.identifiant_national LIKE $1
      LIMIT 20
    `, [`%${q.toLowerCase()}%`]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur recherche élèves.' });
  }
});

// ─────────────────────────────────────────────
// 7. GESTION DES ÉTABLISSEMENTS & IDENTIFIANTS UNIQUE
// ─────────────────────────────────────────────
router.get('/etablissements', auth, checkOfficeBac, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT e.id, e.code_etablissement, e.nom, e.region, e.ville, e.telephone, e.autorisation_numero, e.ia_nom, e.ief_nom, e.created_at,
             u.email as admin_email,
             (SELECT COUNT(*) FROM eleves el WHERE el.etablissement_id = e.id) as total_eleves,
             (SELECT COUNT(*) FROM professeurs_etablissements pe WHERE pe.etablissement_id = e.id) as total_profs
      FROM etablissements e
      LEFT JOIN users u ON e.admin_id = u.id
      ORDER BY e.nom ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur récupération établissements.' });
  }
});

router.post('/etablissements', auth, checkOfficeBac, async (req, res) => {
  const { nom, region, ville, code_etablissement, admin_email, telephone, autorisation_numero, ia_nom, ief_nom } = req.body;
  if (!nom || !admin_email) {
    return res.status(400).json({ message: 'Le nom et l\'email admin sont obligatoires.' });
  }

  try {
    const checkEmail = await db.query('SELECT id FROM users WHERE email = $1', [admin_email]);
    if (checkEmail.rows.length > 0) {
      return res.status(400).json({ message: 'Cet email d\'administrateur est déjà utilisé.' });
    }

    const generatedCode = code_etablissement || await generateIUP('ETAB', region || 'Dakar');

    const tempPassword = `Etab@${Math.floor(100000 + Math.random() * 900000)}`;
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(tempPassword, salt);

    const userRes = await db.query(`
      INSERT INTO users (email, password_hash, role)
      VALUES ($1, $2, 'ADMIN_ETABLISSEMENT') RETURNING id
    `, [admin_email, passwordHash]);
    const adminId = userRes.rows[0].id;

    const etabRes = await db.query(`
      INSERT INTO etablissements (code_etablissement, nom, region, ville, admin_id, telephone, autorisation_numero, ia_nom, ief_nom)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
    `, [generatedCode, nom, region || 'Dakar', ville || 'Dakar', adminId, telephone || '', autorisation_numero || '', ia_nom || null, ief_nom || null]);

    res.status(201).json({
      message: 'Établissement enregistré avec succès ! Identifiants uniques générés.',
      etablissement: etabRes.rows[0],
      credentials: {
        login: admin_email,
        code_etablissement: generatedCode,
        temp_password: tempPassword
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur création établissement.' });
  }
});

// ─────────────────────────────────────────────
// 8. GESTION DES PROFESSEURS & IDENTIFIANTS UNIQUE
// ─────────────────────────────────────────────
router.get('/professeurs', auth, checkOfficeBac, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT DISTINCT ON (u.id) 
        u.id, u.email, u.identifiant_national, 
        COALESCE(p.nom, d.nom, 'Enseignant') as nom, 
        COALESCE(p.prenom, d.prenom, '') as prenom, 
        COALESCE(p.telephone, d.telephone, '') as telephone, 
        COALESCE(p.matiere_principale, d.specialite_ou_code, 'Général') as matiere_principale,
        COALESCE(p.sexe, d.sexe, 'M') as sexe,
        COALESCE(p.cni_numero, d.cni_numero, '') as cni_numero,
        COALESCE(p.matricule_solde, d.matricule_solde, '') as matricule_solde,
        COALESCE(et.nom, 'Établissement National') as etablissement_nom, 
        COALESCE(p.region, et.region, d.region, 'Dakar') as region,
        COALESCE(p.ville, d.ville, 'Dakar') as ville
      FROM users u
      LEFT JOIN professeurs p ON u.id = p.id
      LEFT JOIN demandes_inscription_office d ON u.email = d.email
      LEFT JOIN professeurs_etablissements pe ON u.id = pe.professeur_id
      LEFT JOIN etablissements et ON pe.etablissement_id = et.id
      WHERE u.role = 'PROFESSEUR'
      ORDER BY u.id, p.nom ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur récupération professeurs.' });
  }
});

router.post('/professeurs', auth, checkOfficeBac, async (req, res) => {
  const { nom, prenom, email, telephone, matiere_principale, etablissement_id, identifiant_national, sexe, region, ville, cni_numero, matricule_solde } = req.body;
  if (!email || !nom || !prenom) {
    return res.status(400).json({ message: 'Email, nom et prénom sont obligatoires.' });
  }

  try {
    const checkEmail = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (checkEmail.rows.length > 0) {
      return res.status(400).json({ message: 'Cet email de professeur est déjà utilisé.' });
    }

    const generatedIne = identifiant_national || await generateIUP('ENS', region || 'Dakar');
    const tempPassword = `Prof@${Math.floor(100000 + Math.random() * 900000)}`;
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(tempPassword, salt);

    const userRes = await db.query(`
      INSERT INTO users (email, password_hash, role, identifiant_national)
      VALUES ($1, $2, 'PROFESSEUR', $3) RETURNING id
    `, [email, passwordHash, generatedIne]);
    const profId = userRes.rows[0].id;

    const sexeValue = sexe === 'F' ? 'F' : 'M';
    await db.query(`
      INSERT INTO professeurs (id, nom, prenom, telephone, matiere_principale, sexe, region, ville, cni_numero, matricule_solde)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO UPDATE SET nom = $2, prenom = $3, telephone = $4, matiere_principale = $5, sexe = $6, region = $7, ville = $8, cni_numero = $9, matricule_solde = $10
    `, [profId, nom, prenom, telephone || '', matiere_principale || 'Général', sexeValue, region || 'Dakar', ville || 'Dakar', cni_numero || '', matricule_solde || '']);

    if (etablissement_id) {
      await db.query(`
        INSERT INTO professeurs_etablissements (professeur_id, etablissement_id, statut)
        VALUES ($1, $2, 'CONFIRMÉ')
        ON CONFLICT (professeur_id, etablissement_id) DO UPDATE SET statut = 'CONFIRMÉ'
      `, [profId, etablissement_id]);
    }

    res.status(201).json({
      message: 'Enseignant/Correcteur enregistré avec succès ! Identifiants uniques générés.',
      professeur: { id: profId, nom, prenom, email, identifiant_national: generatedIne },
      credentials: {
        login: email,
        identifiant_national: generatedIne,
        temp_password: tempPassword
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur création professeur.' });
  }
});

// ─────────────────────────────────────────────
// 9. AUTO-INSCRIPTION PUBLIQUE & VALIDATION PAR AGENTS
// ─────────────────────────────────────────────

// Route publique (sans auth) : formulaire d'inscription pour Établissement ou Professeur
router.post('/demande-public', async (req, res) => {
  const {
    type_demande, nom, prenom, email, telephone, region, ville,
    specialite_ou_code, documents_fournis, cni_numero, autorisation_numero, matricule_solde, sexe, ia_nom, ief_nom
  } = req.body;

  if (!type_demande || !nom || !email) {
    return res.status(400).json({ message: 'Le type de demande, le nom et l\'email sont obligatoires.' });
  }

  try {
    const existing = await db.query(
      "SELECT id FROM demandes_inscription_office WHERE email = $1 AND statut = 'EN_ATTENTE'",
      [email]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Une demande d\'inscription est déjà en cours de validation pour cet email.' });
    }

    // Traitement et sauvegarde des fichiers justificatifs (Cloudinary ou local)
    const processedDocs = {};
    if (documents_fournis && typeof documents_fournis === 'object') {
      const uploadsDir = path.join(__dirname, '../../uploads');
      const publicUploadsDir = path.join(__dirname, '../../../frontend/public/uploads');

      for (const [key, item] of Object.entries(documents_fournis)) {
        if (!item) continue;
        if (typeof item === 'object' && item.data && item.name) {
          let uploadedUrl = null;

          // 1. Tenter l'envoi sur Cloudinary si configuré
          if (isCloudinaryConfigured) {
            try {
              const isPdf = item.name.toLowerCase().endsWith('.pdf');
              const resUpload = await cloudinary.uploader.upload(item.data, {
                folder: 'leralscolaire/justificatifs',
                resource_type: isPdf ? 'raw' : 'auto',
                public_id: `${Date.now()}_${key}`
              });
              if (resUpload && resUpload.secure_url) {
                uploadedUrl = resUpload.secure_url;
                processedDocs[key] = uploadedUrl;
              }
            } catch (cloudErr) {
              console.warn(`⚠️ Échec upload Cloudinary pour ${key}, repli local :`, cloudErr.message);
            }
          }

          // 2. Sauvegarde locale en secours ou si Cloudinary non configuré
          if (!uploadedUrl) {
            if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
            const fileExt = path.extname(item.name) || '.png';
            const safeName = `${Date.now()}_${key}${fileExt}`;
            const base64Data = item.data.replace(/^data:([A-Za-z-+\/]+);base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            fs.writeFileSync(path.join(uploadsDir, safeName), buffer);
            if (fs.existsSync(publicUploadsDir)) {
              fs.writeFileSync(path.join(publicUploadsDir, safeName), buffer);
            }
            processedDocs[key] = safeName;
          }
        } else if (typeof item === 'string') {
          processedDocs[key] = item;
        }
      }
    }

    const result = await db.query(`
      INSERT INTO demandes_inscription_office
        (type_demande, nom, prenom, email, telephone, region, ville, specialite_ou_code, documents_fournis, cni_numero, autorisation_numero, matricule_solde, sexe, ia_nom, ief_nom, statut)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'EN_ATTENTE')
      RETURNING *
    `, [
      type_demande, nom, prenom || null, email, telephone || null,
      region || 'Dakar', ville || 'Dakar', specialite_ou_code || null,
      JSON.stringify(processedDocs), cni_numero || null, autorisation_numero || null, matricule_solde || null,
      sexe || 'M', ia_nom || null, ief_nom || null
    ]);

    const createdDemande = result.rows[0];

    // Envoi automatique de l'accusé de réception par email (non-bloquant)
    emailService.sendDemandeReception({
      to: email,
      nom: prenom ? `${prenom} ${nom}` : nom,
      typeDemande: type_demande,
      referenceId: createdDemande.id
    }).catch(e => console.error('Erreur email accusé réception:', e.message));

    res.status(201).json({
      message: 'Votre demande de pré-inscription a été transmise avec succès ! Un accusé de réception vous a été envoyé par email. Nos équipes instruiront votre dossier dans les plus brefs délais.',
      demande: createdDemande
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la soumission de la demande.' });
  }
});

// Liste des demandes d'inscription publiques (pour agents Office BAC)
router.get('/demandes', auth, checkOfficeBac, async (req, res) => {
  const { statut } = req.query;
  try {
    let query = 'SELECT * FROM demandes_inscription_office ORDER BY created_at DESC';
    let params = [];
    if (statut) {
      query = 'SELECT * FROM demandes_inscription_office WHERE statut = $1 ORDER BY created_at DESC';
      params = [statut];
    }
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur récupération des demandes.' });
  }
});

// Valider une demande publique et générer ID + MDP temporaire envoyé par Email
router.put('/demandes/:id/valider', auth, checkOfficeBac, async (req, res) => {
  try {
    const demRes = await db.query('SELECT * FROM demandes_inscription_office WHERE id = $1', [req.params.id]);
    if (demRes.rows.length === 0) return res.status(404).json({ message: 'Demande non trouvée.' });

    const d = demRes.rows[0];
    if (d.statut === 'VALIDÉ') return res.status(400).json({ message: 'Cette demande a déjà été validée.' });

    let credentials = {};

    if (d.type_demande === 'ETABLISSEMENT') {
      const generatedCode = (d.specialite_ou_code && d.specialite_ou_code.startsWith('ETAB-'))
        ? d.specialite_ou_code
        : await generateIUP('ETAB', d.region || 'Dakar');
      const tempPassword = `Etab@${Math.floor(100000 + Math.random() * 900000)}`;

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(tempPassword, salt);

      const userRes = await db.query(`
        INSERT INTO users (email, password_hash, role, identifiant_national, password_provisoire)
        VALUES ($1, $2, 'ADMIN_ETABLISSEMENT', $3, $4) RETURNING id
      `, [d.email, passwordHash, generatedCode, tempPassword]);

      await db.query(`
        INSERT INTO etablissements (code_etablissement, nom, region, ville, admin_id, telephone, autorisation_numero, email_professionnel)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [generatedCode, d.nom, d.region, d.ville, userRes.rows[0].id, d.telephone || '', d.autorisation_numero || '', d.email]);

      credentials = { login: generatedCode, code_etablissement: generatedCode, temp_password: tempPassword };

      // Envoi de l'email officiel d'approbation
      emailService.sendDemandeValidee({
        to: d.email,
        nom: d.nom,
        typeDemande: 'ETABLISSEMENT',
        iup: generatedCode,
        tempPassword: tempPassword
      }).catch(e => console.error('Erreur email validation établissement:', e.message));

    } else {
      // Pour les enseignants, générer systématiquement un véritable IUP (ENS-AAAA-TRI-XXXX)
      const generatedIne = await generateIUP('ENS', d.region || 'Dakar');
      const tempPassword = `Prof@${Math.floor(100000 + Math.random() * 900000)}`;

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(tempPassword, salt);

      const userRes = await db.query(`
        INSERT INTO users (email, password_hash, role, identifiant_national, password_provisoire)
        VALUES ($1, $2, 'PROFESSEUR', $3, $4) RETURNING id
      `, [d.email, passwordHash, generatedIne, tempPassword]);

      await db.query(`
        INSERT INTO professeurs (id, nom, prenom, telephone, matiere_principale, sexe)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET nom = $2, prenom = $3, telephone = $4, matiere_principale = $5, sexe = $6
      `, [userRes.rows[0].id, d.nom, d.prenom || '', d.telephone || '', d.specialite_ou_code || 'Général', d.sexe || 'M']);

      credentials = { login: generatedIne, identifiant_national: generatedIne, temp_password: tempPassword };

      // Envoi de l'email officiel d'approbation
      emailService.sendDemandeValidee({
        to: d.email,
        nom: [d.prenom, d.nom].filter(Boolean).join(' '),
        typeDemande: 'PROFESSEUR',
        iup: generatedIne,
        tempPassword: tempPassword
      }).catch(e => console.error('Erreur email validation professeur:', e.message));
    }

    await db.query(`
      UPDATE demandes_inscription_office
      SET statut = 'VALIDÉ', updated_at = NOW()
      WHERE id = $1
    `, [req.params.id]);

    res.json({
      message: `Demande de ${d.nom} validée avec succès ! Les identifiants et le mot de passe ont été transmis de manière confidentielle à ${d.email}.`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur validation demande.' });
  }
});

// Rejeter une demande publique et envoyer l'email de notification avec motif
router.put('/demandes/:id/rejeter', auth, checkOfficeBac, async (req, res) => {
  const { motif_rejet } = req.body;
  try {
    const demRes = await db.query('SELECT * FROM demandes_inscription_office WHERE id = $1', [req.params.id]);
    if (demRes.rows.length === 0) return res.status(404).json({ message: 'Demande non trouvée.' });

    const d = demRes.rows[0];
    if (d.statut === 'VALIDÉ') return res.status(400).json({ message: 'Impossible de rejeter une demande déjà validée.' });

    const cleanMotif = (motif_rejet || '').trim() || 'Pièces justificatives incomplètes ou non conformes aux critères ministériels.';

    await db.query(`
      UPDATE demandes_inscription_office
      SET statut = 'REJETÉ', motif_rejet = $1, updated_at = NOW()
      WHERE id = $2
    `, [cleanMotif, req.params.id]);

    // Envoi de l'email officiel de rejet / correction
    emailService.sendDemandeRejetee({
      to: d.email,
      nom: [d.prenom, d.nom].filter(Boolean).join(' '),
      typeDemande: d.type_demande,
      motifRejet: cleanMotif
    }).catch(e => console.error('Erreur email rejet:', e.message));

    res.json({ message: `Demande rejetée avec succès. L'email explicatif a été expédié à ${d.email}.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors du rejet de la demande.' });
  }
});

// ─────────────────────────────────────────────
// 10. GESTION ET PARTAGE DES LIVRETS SCOLAIRES DU BAC
// ─────────────────────────────────────────────
router.get('/livrets', auth, checkOfficeBac, async (req, res) => {
  const { annee, serie, statut } = req.query;
  try {
    let query = `
      SELECT l.id, l.annee, l.serie, l.moyenne_seconde, l.moyenne_premiere, l.moyenne_terminale,
             l.appreciation_conseil, l.statut_validation, l.fichier_livret_url, l.created_at,
             e.nom as eleve_nom, e.prenom as eleve_prenom, e.identifiant_national,
             et.nom as etablissement_nom, et.region
      FROM livrets_scolaires_bac l
      JOIN eleves e ON l.eleve_id = e.id
      LEFT JOIN etablissements et ON l.etablissement_id = et.id
    `;
    let params = [];
    let conditions = [];

    if (annee) {
      params.push(annee);
      conditions.push(`l.annee = $${params.length}`);
    }
    if (serie) {
      params.push(serie);
      conditions.push(`l.serie = $${params.length}`);
    }
    if (statut) {
      params.push(statut);
      conditions.push(`l.statut_validation = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY e.nom ASC, e.prenom ASC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur récupération des livrets scolaires.' });
  }
});

router.post('/livrets', auth, checkOfficeBac, async (req, res) => {
  const { eleve_id, etablissement_id, annee, serie, moyenne_seconde, moyenne_premiere, moyenne_terminale, appreciation_conseil } = req.body;
  if (!eleve_id || !serie) {
    return res.status(400).json({ message: 'L\'élève et la série sont obligatoires.' });
  }

  try {
    const result = await db.query(`
      INSERT INTO livrets_scolaires_bac
        (eleve_id, etablissement_id, annee, serie, moyenne_seconde, moyenne_premiere, moyenne_terminale, appreciation_conseil, statut_validation)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'CONFORME')
      RETURNING *
    `, [
      eleve_id, etablissement_id || null, annee || new Date().getFullYear(),
      serie, moyenne_seconde || null, moyenne_premiere || null, moyenne_terminale || null,
      appreciation_conseil || null
    ]);

    res.status(201).json({ message: 'Livret scolaire transmis avec succès au Jury du BAC !', livret: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur enregistrement livret scolaire.' });
  }
});

router.put('/livrets/:id/valider', auth, checkOfficeBac, async (req, res) => {
  const { statut_validation } = req.body;
  try {
    const result = await db.query(`
      UPDATE livrets_scolaires_bac
      SET statut_validation = $1, updated_at = NOW()
      WHERE id = $2 RETURNING *
    `, [statut_validation || 'CONFORME', req.params.id]);

    res.json({ message: `Statut du livret mis à jour : ${statut_validation}`, livret: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur validation livret.' });
  }
});

// ─────────────────────────────────────────────
// 11. REGISTRE & GESTION DES JURYS & CENTRES D'EXAMEN (OFFICE DU BAC)
// ─────────────────────────────────────────────

// Obtenir la liste des Jurys (avec filtre possible par région/série)
router.get('/jurys', auth, async (req, res) => {
  const { region, annee, type_examen } = req.query;
  try {
    let query = 'SELECT * FROM jurys_bac';
    let params = [];
    let conditions = [];

    if (region) {
      params.push(region);
      conditions.push(`region = $${params.length}`);
    }
    if (annee) {
      params.push(annee.toString());
      conditions.push(`(annee::text = $${params.length}::text OR annee IS NULL)`);
    }
    if (type_examen) {
      params.push(type_examen);
      conditions.push(`(type_examen = $${params.length} OR type_examen IS NULL)`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY region ASC, numero_jury ASC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur récupération des jurys.' });
  }
});

// ─────────────────────────────────────────────
// GESTION DES CENTRES D'EXAMEN BAC (PRÉ-CONFIGURATION)
// ─────────────────────────────────────────────
router.get('/centres-examen', auth, checkOfficeBac, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.*, p.nom_centre as centre_principal_nom
      FROM centres_examen_bac c
      LEFT JOIN centres_examen_bac p ON c.centre_principal_id = p.id
      ORDER BY c.region ASC, COALESCE(c.centre_principal_id, c.id) ASC, c.type_centre ASC, c.nom_centre ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur récupération des centres d\'examen.' });
  }
});

router.post('/centres-examen', auth, checkOfficeBac, async (req, res) => {
  const { nom_centre, type_centre, centre_principal_id, region, zone_commune, effectif_previsionnel, series_disponibles } = req.body;
  if (!nom_centre || !region || !zone_commune) {
    return res.status(400).json({ message: 'Le nom du centre, la région et la zone sont obligatoires.' });
  }

  try {
    const seriesArr = Array.isArray(series_disponibles) ? series_disponibles : ['S1', 'S2', 'L1', 'L2'];
    const result = await db.query(`
      INSERT INTO centres_examen_bac (nom_centre, type_centre, centre_principal_id, region, zone_commune, effectif_previsionnel, series_disponibles)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [nom_centre, type_centre || 'PRINCIPAL', centre_principal_id || null, region, zone_commune, parseInt(effectif_previsionnel) || 0, seriesArr]);

    res.status(201).json({ message: 'Centre d\'examen pré-configuré avec succès !', centre: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ message: 'Ce centre d\'examen existe déjà.' });
    }
    console.error(err);
    res.status(500).json({ message: 'Erreur création du centre d\'examen.' });
  }
});

router.put('/centres-examen/:id', auth, checkOfficeBac, async (req, res) => {
  const { nom_centre, type_centre, centre_principal_id, region, zone_commune, effectif_previsionnel, series_disponibles } = req.body;
  try {
    const seriesArr = Array.isArray(series_disponibles) ? series_disponibles : ['S1', 'S2', 'L1', 'L2'];
    const result = await db.query(`
      UPDATE centres_examen_bac
      SET nom_centre = $1, type_centre = $2, centre_principal_id = $3, region = $4, zone_commune = $5,
          effectif_previsionnel = $6, series_disponibles = $7, updated_at = NOW()
      WHERE id = $8 RETURNING *
    `, [nom_centre, type_centre || 'PRINCIPAL', centre_principal_id || null, region, zone_commune, parseInt(effectif_previsionnel) || 0, seriesArr, req.params.id]);

    if (result.rows.length === 0) return res.status(404).json({ message: 'Centre d\'examen introuvable.' });
    res.json({ message: 'Centre d\'examen mis à jour avec succès !', centre: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur mise à jour centre d\'examen.' });
  }
});

router.delete('/centres-examen/:id', auth, checkOfficeBac, async (req, res) => {
  try {
    await db.query('DELETE FROM centres_examen_bac WHERE id = $1', [req.params.id]);
    res.json({ message: 'Centre d\'examen supprimé avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur suppression centre d\'examen.' });
  }
});

// Créer un nouveau Jury (Office du BAC) et notifier le Président par messagerie
router.post('/jurys', auth, checkOfficeBac, async (req, res) => {
  const { numero_jury, centre_examen_id, centre_examen, centre_secondaire, region, zone_commune, series_autorisees, annee, type_examen, president_prof_id, president_jury } = req.body;
  if (!numero_jury || !centre_examen || !region) {
    return res.status(400).json({ message: 'Le numéro de jury, le centre et la région sont obligatoires.' });
  }

  const currentAnnee = annee || new Date().getFullYear();
  const currentTypeExamen = type_examen || 'BAC';

  try {
    // 1. Vérifier si ce numéro de jury existe déjà pour cette session et ce type d'examen
    const checkExists = await db.query(
      'SELECT id FROM jurys_bac WHERE LOWER(numero_jury) = LOWER($1) AND annee = $2 AND (type_examen = $3 OR type_examen IS NULL)',
      [numero_jury, currentAnnee, currentTypeExamen]
    );
    if (checkExists.rows.length > 0) {
      return res.status(400).json({ message: `Le ${numero_jury} a déjà été créé pour la session ${currentTypeExamen} ${currentAnnee}. Veuillez choisir un autre numéro (ex: Jury 002).` });
    }

    let finalPresidentName = president_jury || null;
    let profEmail = null;
    let tempIdentifiant = null;
    let tempMotDePasse = null;
    let tempHash = null;
    let dateExpiration = null;

    // Récupération de la date d'expiration globale configurée pour la session
    const settingRes = await db.query("SELECT setting_value FROM office_bac_settings WHERE setting_key = 'session_expiration_date'");
    if (settingRes.rows.length > 0 && settingRes.rows[0].setting_value) {
      dateExpiration = new Date(settingRes.rows[0].setting_value);
    } else {
      dateExpiration = new Date();
      dateExpiration.setDate(dateExpiration.getDate() + 30); // 30 jours par défaut
    }

    if (president_prof_id) {
      const profRes = await db.query(`
        SELECT u.id, u.email, p.nom, p.prenom
        FROM users u
        LEFT JOIN professeurs p ON u.id = p.id
        WHERE u.id = $1
      `, [president_prof_id]);

      if (profRes.rows.length > 0) {
        const prof = profRes.rows[0];
        finalPresidentName = `Pr. ${prof.prenom || ''} ${prof.nom || ''}`.trim();
        profEmail = prof.email;
      }

      // Génération des identifiants temporaires uniques pour la présidence du jury
      const cleanNum = numero_jury.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      tempIdentifiant = `PRESIDENT.${cleanNum}@officebac.sn`;
      tempMotDePasse = `BAC2026#${Math.floor(1000 + Math.random() * 9000)}`;
      tempHash = await bcrypt.hash(tempMotDePasse, 10);
    }

    // 2. Insérer le jury avec ses accès temporaires dans la base de données
    const result = await db.query(`
      INSERT INTO jurys_bac
        (numero_jury, centre_examen_id, centre_examen, centre_secondaire, region, zone_commune, series_autorisees, annee, type_examen, president_prof_id, president_jury, identifiant_temporaire, mot_de_passe_temporaire, password_hash, date_expiration_acces, statut_acces, statut)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'ACTIF', 'ACTIF')
      RETURNING *
    `, [
      numero_jury, centre_examen_id || null, centre_examen, centre_secondaire || null, region, zone_commune || null,
      series_autorisees || 'Toutes séries', currentAnnee, currentTypeExamen,
      president_prof_id || null, finalPresidentName,
      tempIdentifiant, tempMotDePasse, tempHash, dateExpiration
    ]);

    // 3. Transmettre la convocation officielle par messagerie interne (avec PDF joint)
    if (president_prof_id && profEmail) {
      const dateExpStr = dateExpiration.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

      let pdfMeta = { fileName: null, fileUrl: null };
      try {
        pdfMeta = await generateConvocationPDF({
          numero_jury,
          centre_examen,
          region,
          zone_commune,
          series_autorisees,
          type_examen: currentTypeExamen,
          annee: currentAnnee,
          president_jury: finalPresidentName,
          identifiant_temporaire: tempIdentifiant,
          mot_de_passe_temporaire: tempMotDePasse,
          date_expiration_str: dateExpStr
        });
      } catch (pdfErr) {
        console.error('Erreur génération PDF convocation:', pdfErr);
      }

      const sujetMsg = `📜 CONVOCATION OFFICIELLE & ACCÈS TEMPORAIRES — Présidence du ${numero_jury} (Session ${currentTypeExamen} ${currentAnnee})`;
      const contenuMsg = `RÉPUBLIQUE DU SÉNÉGAL\nMinistère de l'Éducation Nationale — Office du Baccalauréat\n------------------------------------------------------------\nCONVOCATION OFFICIELLE DE PRÉSIDENT DE JURY & ACCÈS SÉCURISÉS\n------------------------------------------------------------\n\nMadame, Monsieur ${finalPresidentName},\n\nVous êtes officiellement désigné(e) par l'Office du Baccalauréat du Sénégal en qualité de Président(e) du ${numero_jury} pour la session ${currentTypeExamen} ${currentAnnee}.\n\n📍 Centre d'Examen : ${centre_examen} (${region} - ${zone_commune || 'Centre'})\n📚 Séries Attribuées : ${series_autorisees || 'S1, S2, L1, L2'}\n\n============================================================\n🔑 VOS ACCÈS TEMPORAIRES SÉCURISÉS (PORTAIL PRÉSIDENT DU JURY) :\n• Identifiant Temporaire : ${tempIdentifiant}\n• Mot de Passe Temporaire : ${tempMotDePasse}\n• Date Limite d'Expiration : ${dateExpStr}\n============================================================\n\n📄 Votre lettre de convocation officielle imprimable au format PDF est ci-jointe à ce message.\n\n📌 Note Importante :\nVos accès temporaires d'examen et votre badge officiel "🎖️ Président du Jury" s'auto-verrouilleront automatiquement le ${dateExpStr}. Votre compte enseignant habituel au sein de votre établissement reste 100% intact.\n\nL'Office du Baccalauréat du Sénégal.`;

      await db.query(`
        INSERT INTO messages (expediteur_id, destinataire_type, destinataire_id, sujet, contenu, fichier_url, fichier_nom)
        VALUES ($1, 'PROFESSEUR', $2, $3, $4, $5, $6)
      `, [req.user.id, president_prof_id, sujetMsg, contenuMsg, pdfMeta.fileUrl, pdfMeta.fileName]);

      console.log(`✉️ [CONVOCATION & PDF ENVOYÉS] Message expédié à ${profEmail} pour la présidence du ${numero_jury}`);
    }

    res.status(201).json({
      message: `Jury ${numero_jury} créé avec succès !${profEmail ? ' Convocation transmise au Président via messagerie.' : ''}`,
      jury: result.rows[0]
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ message: `Le ${numero_jury} existe déjà pour la session ${currentAnnee}.` });
    }
    console.error(err);
    res.status(500).json({ message: 'Erreur création du jury.' });
  }
});

// Réattribuer ou corriger le jury et centre d'examen d'un candidat (Gestion des erreurs Office du BAC)
router.put('/candidats/:id/reattribuer-jury', auth, checkOfficeBac, async (req, res) => {
  const { jury, centre_examen } = req.body;
  try {
    const result = await db.query(`
      UPDATE resultats_examens_nationaux
      SET jury = $1, centre_examen = $2, updated_at = NOW()
      WHERE id = $3 RETURNING *
    `, [jury, centre_examen, req.params.id]);

    res.json({ message: 'Rattachement du jury corrigé avec succès !', candidat: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur réattribution jury.' });
  }
});

// ─────────────────────────────────────────────
// 8. ALGORITHME DE RÉPARTITION ALPHABÉTIQUE PAR CAPACITÉ ET ZONE
// ─────────────────────────────────────────────
router.post('/dispatch-alphabetique', auth, checkOfficeBac, async (req, res) => {
  const { type_examen, annee, capacite_defaut } = req.body;
  const currentType = type_examen || 'BAC';
  const currentAnnee = annee || new Date().getFullYear();
  const maxCap = parseInt(capacite_defaut) || 120;

  try {
    const jurysRes = await db.query(`
      SELECT * FROM jurys_bac 
      WHERE (type_examen = $1 OR type_examen IS NULL) AND (annee = $2 OR annee IS NULL)
      ORDER BY numero_jury ASC
    `, [currentType, currentAnnee]);

    if (jurysRes.rows.length === 0) {
      return res.status(400).json({ message: 'Aucun jury créé pour cette session. Veuillez créer au moins un jury (ex: Jury 001).' });
    }

    const jurys = jurysRes.rows;

    const candRes = await db.query(`
      SELECT r.id, r.eleve_id, e.nom, e.prenom, e.identifiant_national
      FROM resultats_examens_nationaux r
      JOIN eleves e ON r.eleve_id = e.id
      WHERE (r.type_examen = $1 OR r.type_examen IS NULL)
      ORDER BY e.nom ASC, e.prenom ASC
    `, [currentType]);

    const candidats = candRes.rows;
    if (candidats.length === 0) {
      return res.status(400).json({ message: 'Aucun candidat trouvé pour la répartition.' });
    }

    let juryIdx = 0;
    let countInCurrentJury = 0;
    let assignedCount = 0;

    for (let i = 0; i < candidats.length; i++) {
      const c = candidats[i];
      const jury = jurys[juryIdx];
      const juryCap = jury.capacite_max || maxCap;

      if (countInCurrentJury >= juryCap && juryIdx < jurys.length - 1) {
        juryIdx++;
        countInCurrentJury = 0;
      }

      const activeJury = jurys[juryIdx];
      const juryNumberInt = parseInt((activeJury.numero_jury || '').replace(/\D/g, '')) || (juryIdx + 1);
      const tableNum = (100000 + (juryNumberInt * 100) + (countInCurrentJury + 1)).toString();

      await db.query(`
        UPDATE resultats_examens_nationaux
        SET jury = $1, centre_examen = $2, numero_table = $3, updated_at = NOW()
        WHERE id = $4
      `, [activeJury.numero_jury, activeJury.centre_examen, tableNum, c.id]);

      countInCurrentJury++;
      assignedCount++;
    }

    res.json({
      message: `Répartition alphabétique réussie ! ${assignedCount} candidat(s) réparti(s) automatiquement sur ${jurys.length} jury(s) avec numéros de table attribués.`,
      assignedCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la répartition alphabétique.' });
  }
});

// ─────────────────────────────────────────────
// 9. TRANSMISSION OFFICIELLE DES LIVRETS PAR L'ÉTABLISSEMENT VERS LA ZONE
// ─────────────────────────────────────────────
router.post('/transmettre-livrets-zone', auth, async (req, res) => {
  try {
    const etabRes = await db.query('SELECT id, nom, region, zone_examen FROM etablissements WHERE admin_id = $1', [req.user.id]);
    if (etabRes.rows.length === 0) {
      return res.status(404).json({ message: 'Établissement non trouvé.' });
    }
    const etab = etabRes.rows[0];

    const result = await db.query(`
      UPDATE livrets_scolaires_bac
      SET statut_transmission = 'TRANSMIS', transmis_at = NOW(), updated_at = NOW()
      WHERE etablissement_id = $1
      RETURNING id
    `, [etab.id]);

    res.json({
      message: `Succès ! ${result.rows.length} livret(s) scolaire(s) officiel(s) transmis à l'Office du BAC (Zone ${etab.zone_examen || etab.region || 'Nationale'}).`,
      count: result.rows.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la transmission des livrets.' });
  }
});

// ─────────────────────────────────────────────
// 10. RESTITUTION GLOBALE DES LIVRETS AUX ÉTABLISSEMENTS (FIN DES ÉPREUVES)
// ─────────────────────────────────────────────
router.post('/restituer-livrets', auth, checkOfficeBac, async (req, res) => {
  const { annee } = req.body;
  const currentAnnee = annee || new Date().getFullYear();

  try {
    const result = await db.query(`
      UPDATE livrets_scolaires_bac
      SET statut_transmission = 'RESTITUÉ_ÉTABLISSEMENT', restitue_at = NOW(), updated_at = NOW()
      WHERE annee = $1
      RETURNING id, etablissement_id
    `, [currentAnnee]);

    const count = result.rows.length;

    const etabsRes = await db.query(`
      SELECT DISTINCT admin_id, nom FROM etablissements WHERE admin_id IS NOT NULL
    `);

    for (const etab of etabsRes.rows) {
      await db.query(`
        INSERT INTO notifications (user_id, titre, description, type)
        VALUES ($1, $2, $3, 'info')
      `, [
        etab.admin_id,
        `📜 Restitution des Livrets Scolaires (BAC ${currentAnnee})`,
        `L'Office du Baccalauréat informe l'établissement "${etab.nom}" que tous les livrets scolaires de la session BAC ${currentAnnee} ont été officiellement restitués et archivés.`
      ]);
    }

    res.json({
      message: `Succès ! ${count} livret(s) scolaire(s) officiel(s) ont été restitués aux établissements pour la session BAC ${currentAnnee}.`,
      count,
      etablissements_notifies: etabsRes.rows.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la restitution des livrets scolaires.' });
  }
});

// Récupérer la date d'expiration globale de la session
router.get('/settings/expiration-date', auth, checkOfficeBac, async (req, res) => {
  try {
    const result = await db.query("SELECT setting_value FROM office_bac_settings WHERE setting_key = 'session_expiration_date'");
    res.json({
      setting_value: result.rows.length > 0 ? result.rows[0].setting_value : null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur récupération date d\'expiration.' });
  }
});

// Enregistrer la date d'expiration globale de la session
router.post('/settings/expiration-date', auth, checkOfficeBac, async (req, res) => {
  const { expiration_date } = req.body;
  try {
    await db.query(`
      INSERT INTO office_bac_settings (setting_key, setting_value, updated_at)
      VALUES ('session_expiration_date', $1, NOW())
      ON CONFLICT (setting_key)
      DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = NOW()
    `, [expiration_date]);

    // Mettre à jour rétroactivement les jurys actifs sans date d'expiration ou les adapter
    if (expiration_date) {
      await db.query(`
        UPDATE jurys_bac
        SET date_expiration_acces = $1
        WHERE statut = 'ACTIF'
      `, [new Date(expiration_date)]);
    }

    res.json({ message: 'Date d\'expiration globale de la session mise à jour avec succès !' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur mise à jour date d\'expiration.' });
  }
});

module.exports = router;
